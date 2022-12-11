import EventEmitter from 'events';
import {
  MessageInput,
  MessageStoreItem,
  MSG_STATUSES,
} from '../messages/types';
import { ExtensionStorage } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import ObservableStore from 'obs-store';
import { RemoteConfigController } from './RemoteConfigController';
import { extension } from '../lib';
import { PreferencesAccount } from '../preferences';
import { PermissionController, PERMISSIONS } from './PermissionController';

export class MessageController extends EventEmitter {
  private messages;
  private store;
  private getMessagesConfig;
  setPermission;
  constructor({
    extensionStorage,
    getMessagesConfig,
    setPermission,
  }: {
    extensionStorage: ExtensionStorage;
    getMessagesConfig: RemoteConfigController['getMessagesConfig'];
    setPermission: PermissionController['setPermission'];
  }) {
    super();

    this.messages = extensionStorage.getInitState({
      messages: [],
    });

    this.store = new ObservableStore(this.messages);
    extensionStorage.subscribe(this.store);

    this.getMessagesConfig = getMessagesConfig;
    this.setPermission = setPermission;

    extension.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'rejectMessages') {
        this.rejectAllByTime();
      }
    });

    this.rejectAllByTime();

    this._updateBadge();
  }

  async newMessage(messageInput: MessageInput) {
    let message: MessageStoreItem;

    try {
      message = await this._generateMessage(messageInput);
    } catch (error) {}

    const messages = this.store.getState().messages;

    while (messages.length > this.getMessagesConfig().max_messages) {
      const oldest = messages
        .filter((msg) => Object.values(MSG_STATUSES).includes(msg.status))
        .sort((a, b) => a.timestamp - b.timestamp)[0];
      if (oldest) {
        this._deleteMessage(oldest.id);
      } else {
        break;
      }
    }

    const { options } = messageInput;
    const { getMeta } = options || {};
    if (getMeta) {
      return {
        noSign: true,
        id: message.id,
        hash: message.messageHash,
      };
    }
    messages.push(message);

    this._updateStore(messages);
    return { id: message.id };
  }

  deleteMessage(id: string) {
    return this._deleteMessage(id);
  }

  rejectAllByTime() {
    const { message_expiration_ms } = this.getMessagesConfig();
    const time = Date.now();
    const { messages } = this.store.getState();
    messages.forEach(({ id, timestamp, status }) => {
      if (
        time - timestamp > message_expiration_ms &&
        status === MSG_STATUSES.UNAPPROVED
      ) {
        this.reject(id);
      }
    });
    this._updateMessagesByTimeout();
  }

  reject(id: string, forever?: boolean) {
    const message = this._getMessageById(id);
    message.status = !forever
      ? MSG_STATUSES.REJECTED
      : MSG_STATUSES.REJECTED_FOREVER;
    this._updateMessage(message);
    this.emit(`${message.id}:finished`, message);
  }

  async approve(id: string, account?: PreferencesAccount) {
    const message = this._getMessageById(id);
    message.account = account || message.account;

    if (!message.account) {
      throw new Error(
        'Message has empty account filled and no address is provided'
      );
    }

    try {
      await this._signMessage(message);

      // if (
      //   message.broadcast &&
      //   (message.type === 'transaction' ||
      //     message.type === 'order' ||
      //     message.type === 'cancelOrder')
      // ) {
      //   message.result = await this.broadcast(message);
      //   message.status = MSG_STATUSES.PUBLISHED;
      // }

      if (message.successPath) {
        const url = new URL(message.successPath);

        switch (message.type) {
          case 'auth':
            if (message.result && typeof message.result !== 'string') {
              url.searchParams.append('p', message.result.publicKey);
              url.searchParams.append('s', message.result.signature);
              url.searchParams.append('a', message.result.address);
              this.emit('Open new tab', url.href);
            }
            break;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      message.status = MSG_STATUSES.FAILED;
      message.err = {
        message: e.toString(),
        stack: e.stack,
      };
    }

    this._updateMessage(message);
    this.emit(`${message.id}:finished`, message);

    if (message.status === MSG_STATUSES.FAILED) {
      throw new Error(message.err.message);
    }

    return message;
  }

  getMessageById(id: string) {
    return this._getMessageById(id);
  }

  getUnapproved() {
    return this.messages.messages.filter(
      ({ status }) => status === MSG_STATUSES.UNAPPROVED
    );
  }

  _updateMessagesByTimeout() {
    const { update_messages_ms } = this.getMessagesConfig();
    extension.alarms.create('rejectMessages', {
      delayInMinutes: update_messages_ms / 1000 / 60,
    });
  }

  _updateMessage(message: MessageStoreItem) {
    const messages = this.store.getState().messages;
    const id = message.id;
    const index = messages.findIndex((message) => message.id === id);
    messages[index] = message;
    this._updateStore(messages);
  }

  _getMessageById(id: string) {
    const result = this.store
      .getState()
      .messages.find((message) => message.id === id);
    if (!result) throw new Error(`Failed to get message with id ${id}`);
    return result;
  }

  _deleteMessage(id: string) {
    const { messages } = this.store.getState();
    const index = messages.findIndex((message) => message.id === id);
    if (index > -1) {
      messages.splice(index, 1);
      this._updateStore(messages);
    }
  }

  _updateStore(messages: MessageStoreItem[]) {
    this.messages = { ...this.store.getState(), messages };
    this.store.updateState(this.messages);
    this._updateBadge();
  }

  async _generateMessage(
    messageInput: MessageInput
  ): Promise<MessageStoreItem> {
    const message = {
      ...messageInput,
      id: uuidv4(),
      timestamp: Date.now(),
      ext_uuid: messageInput.options && messageInput.options.uid,
      status: MSG_STATUSES.UNAPPROVED,
    };

    if (!message.data && message.type !== 'authOrigin') {
      throw new Error('should contain a data field');
    }

    switch (message.type) {
      case 'authOrigin':
        return {
          ...message,
          successPath: message.data.successPath || undefined,
        };
    }
  }

  _updateBadge() {
    this.emit('Update badge');
  }

  async _signMessage(message: MessageStoreItem) {
    switch (message.type) {
      case 'authOrigin':
        message.result = { approved: 'OK' };
        this.setPermission(message.origin, PERMISSIONS.APPROVED);
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`Unknown message type ${(message as any).type}`);
    }
    message.status = MSG_STATUSES.SIGNED;
  }
}
