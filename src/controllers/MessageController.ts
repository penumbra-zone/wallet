import EventEmitter from 'events'
import { nanoid } from 'nanoid'
import ObservableStore from 'obs-store'
import { extension } from '../lib'
import {
	Message,
	MessageInput,
	MessageInputOfType,
	MessageStatus,
} from '../messages/types'
import { ExtensionStorage } from '../storage'
import { PermissionController, PERMISSIONS } from './PermissionController'
import { RemoteConfigController } from './RemoteConfigController'
import { TransactionController } from './TransactionController'

export class MessageController extends EventEmitter {
	private store
	private getMessagesConfig
	public setPermission
	constructor({
		extensionStorage,
		getMessagesConfig,
		setPermission,
	}: {
		extensionStorage: ExtensionStorage
		getMessagesConfig: RemoteConfigController['getMessagesConfig']
		setPermission: PermissionController['setPermission']
	}) {
		super()

		this.store = new ObservableStore(
			extensionStorage.getInitState({
				messages: [],
			})
		)
		extensionStorage.subscribe(this.store)

		this.getMessagesConfig = getMessagesConfig
		this.setPermission = setPermission

		this._rejectAllByTime()

		extension.alarms.onAlarm.addListener(({ name }) => {
			if (name === 'rejectMessages') {
				this._rejectAllByTime()
			}
		})

		this._updateBadge()
	}

	async newMessage<T extends MessageInput['type']>(
		messageInput: MessageInputOfType<T>
	) {
		try {
			const message = await this._generateMessage(messageInput)
			const { messages } = this.store.getState()
			this._updateStore(messages.concat(message))
			return message
		} catch (e) {
			console.error('newMessage:', e)
		}
	}

	async getMessageResult(id: string) {
		const message = this.getMessageById(id)

		switch (message.status) {
			case MessageStatus.Signed:
			case MessageStatus.Published:
				return message.result
			case MessageStatus.Rejected:
				throw new Error('User denied message')
			case MessageStatus.Failed:
				throw new Error('Failed request')
		}

		const finishedMessage = await new Promise<Message>(resolve => {
			this.on(`${id}:finished`, resolve)
		})

		switch (finishedMessage.status) {
			case MessageStatus.Signed:
			case MessageStatus.Published:
				return finishedMessage.result
			case MessageStatus.Rejected:
			case MessageStatus.RejectedForever:
				throw new Error('User denied message')
			case MessageStatus.Failed:
				throw new Error('Failed request')
			default:
				throw new Error('Unknown error')
		}
	}

	getMessageById(id: string): Message {
		const result = this.store
			.getState()
			.messages.find(message => message.id === id)
		if (!result) throw new Error(`Failed to get message with id ${id}`)
		return result
	}

	deleteMessage(id: string) {
		const { messages } = this.store.getState()
		const index = messages.findIndex(message => message.id === id)
		if (index > -1) {
			messages.splice(index, 1)
			this._updateStore(messages)
		}
	}

	async approve(id: string, result?: any) {
		const message = this.getMessageById(id)

		try {
			switch (message.type) {
				case 'authOrigin':
					this.setPermission(message.origin, PERMISSIONS.APPROVED)
					message.result = { approved: 'OK' }
					message.status = MessageStatus.Signed
					break
				case 'transaction': {
					message.status = MessageStatus.Signed
					message.result = result
					break
				}
			}

			this._updateMessage(message)
			this.emit(`${message.id}:finished`, message)
			return message
		} catch (e) {
			const errorMessage =
				e && typeof e === 'object' && 'message' in e && e.message
					? String(e.message)
					: String(e)

			Object.assign(message, {
				status: MessageStatus.Failed,
				err: errorMessage,
			})
			this._updateMessage(message)
			this.emit(`${message.id}:finished`, message)

			if (e instanceof Error) {
				throw e
			} else {
				throw new Error(errorMessage)
			}
		}
	}

	reject(id: string) {
		const message = this.getMessageById(id)
		message.status = MessageStatus.Rejected

		this._updateMessage(message)

		this.emit(`${message.id}:finished`, message)
	}

	rejectByOrigin(byOrigin: string) {
		const { messages } = this.store.getState()

		messages.forEach(({ id, origin }) => {
			if (byOrigin === origin) {
				this.reject(id)
			}
		})
	}

	removeMessagesFromConnection(connectionId: string) {
		const { messages } = this.store.getState()

		messages.forEach(message => {
			if (message.connectionId === connectionId) {
				this.reject(message.id)
			}
		})

		this._updateStore(
			messages.filter(message => message.connectionId !== connectionId)
		)
	}

	clearMessages(ids?: string | string[]) {
		if (typeof ids === 'string') {
			this.deleteMessage(ids)
		} else if (ids && ids.length > 0) {
			ids.forEach(id => this.deleteMessage(id))
		} else {
			this._updateStore([])
		}
	}

	getUnapproved() {
		return this.store
			.getState()
			.messages.filter(({ status }) => status === MessageStatus.UnApproved)
	}

	_rejectAllByTime() {
		const { message_expiration_ms } = this.getMessagesConfig()

		const { messages } = this.store.getState()
		messages.forEach(({ id, timestamp, status }) => {
			if (
				Date.now() - timestamp > message_expiration_ms &&
				status === MessageStatus.UnApproved
			) {
				this.reject(id)
			}
		})
		this._updateMessagesByTimeout()
	}

	_updateMessagesByTimeout() {
		const { update_messages_ms } = this.getMessagesConfig()
		extension.alarms.create('rejectMessages', {
			delayInMinutes: update_messages_ms / 1000 / 60,
		})
	}

	_updateMessage(message: Message) {
		const messages = this.store.getState().messages
		const index = messages.findIndex(msg => msg.id === message.id)
		messages[index] = message
		this._updateStore(messages)
	}

	_updateStore(messages: Message[]) {
		this.store.updateState({ ...this.store.getState(), messages })
		this._updateBadge()
	}

	_updateBadge() {
		this.emit('Update badge')
	}

	async _generateMessage(messageInput: MessageInput): Promise<Message> {
		if (!messageInput.data && messageInput.type !== 'authOrigin') {
			throw `should contain a data field ${messageInput}`
		}
		switch (messageInput.type) {
			case 'authOrigin':
				return {
					...messageInput,
					id: nanoid(),
					extUuid: messageInput.options && messageInput.options.uid,
					status: MessageStatus.UnApproved,
					timestamp: Date.now(),
				}
			case 'transaction': {
				return {
					...messageInput,
					extUuid: messageInput.options ? messageInput.options.uid : undefined,
					data: messageInput.data,
					id: nanoid(),
					input: messageInput,
					status: MessageStatus.UnApproved,
					successPath: messageInput.data.successPath,
					timestamp: Date.now(),
				}
			}
		}
	}
}
