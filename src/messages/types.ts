import { PreferencesAccount } from '../preferences'

export const MSG_STATUSES = {
	UNAPPROVED: 'unapproved',
	SIGNED: 'signed',
	PUBLISHED: 'published',
	FAILED: 'failed',
	REJECTED: 'rejected',
	REJECTED_FOREVER: 'rejected_forever',
	SHOWED_NOTIFICATION: 'showed_notify',
	NEW_NOTIFICATION: 'new_notify',
} as const

export type MsgStatus = typeof MSG_STATUSES[keyof typeof MSG_STATUSES]

export type MessageInput = {
	connectionId?: string
	account: PreferencesAccount
	broadcast?: boolean
	options?: {
		getMeta?: unknown
		uid?: unknown
	}
	successPath?: string | null
	title?: string | null
} & (
	| {
			type: 'auth'
			origin?: string
			data: {
				data: string
				host?: string
				icon?: string
				isRequest?: boolean
				name?: string
				origin?: string
				referrer?: string
				successPath?: string
				type?: number
			}
	  }
	| {
			type: 'authOrigin'
			origin: string
			data: {
				data?: unknown
				isRequest?: boolean
				origin: string
				successPath?: string
				type?: never
			}
	  }
	| {
			type: 'transaction'
			origin: string
			data: any
	  }
)

export type MessageStoreItem = {
	connectionId?: string
	account: PreferencesAccount
	broadcast?: boolean
	err?: any
	ext_uuid: unknown
	id: string
	json?: string
	lease?: unknown
	status: MsgStatus
	successPath?: string | null
	timestamp: number
	title?: string | null
} & (
	| {
			type: 'auth'
			origin?: string
			result?:
				| string
				| {
						host: string
						name: unknown
						prefix: string
						address: string
						publicKey: string
						signature: string
						version: number | undefined
				  }
			messageHash: string
			data: {
				type: 1000
				referrer: string | undefined
				isRequest: boolean | undefined
				data: {
					data: string
					prefix: string
					host: string
					name: string | undefined
					icon: string | undefined
				}
			}
	  }
	| {
			type: 'authOrigin'
			origin: string
			result?: { approved: 'OK' }
			messageHash?: never
			data: {
				type?: never
				data?: unknown
			}
	  }
	| {
			type: 'transaction'
			origin: string
			result?: { approved: 'OK' }
			messageHash?: never
			data: any
	  }
)
