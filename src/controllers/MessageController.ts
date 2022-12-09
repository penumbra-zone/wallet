import EventEmitter from 'events';
import {
  MessageInput,
  MessageStoreItem,
  MSG_STATUSES,
} from '../messages/types';
import { ExtensionStorage } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import ObservableStore from 'obs-store';

export class MessageController extends EventEmitter {
  private messages;
  private store;
  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    super();

    this.messages = extensionStorage.getInitState({
      messages: [],
    });

    this.store = new ObservableStore(this.messages);
    extensionStorage.subscribe(this.store);
  }

  async newMessage(messageInput: MessageInput) {
    let message: MessageStoreItem;

    try {
      message = await this._generateMessage(messageInput);
    } catch (error) {}

    const messages = this.store.getState().messages;
    //TODO add logic
    // while (messages.length > this.getMessagesConfig().max_messages) {
    //   const oldest = messages
    //     .filter((msg) => Object.values(MSG_STATUSES).includes(msg.status))
    //     .sort((a, b) => a.timestamp - b.timestamp)[0];
    //   if (oldest) {
    //     this._deleteMessage(oldest.id);
    //   } else {
    //     break;
    //   }
    // }

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

  _updateStore(messages: MessageStoreItem[]) {
    this.messages = { ...this.store.getState(), messages };
    this.store.updateState(this.messages);
    // this._updateBadge();
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
    console.log(message);

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
}
