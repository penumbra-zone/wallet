import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'
import { PreferencesAccount } from '../preferences'

export type MessageInput = {
	account: PreferencesAccount
	connectionId: string
	origin: string
	options?: { uid?: unknown }
} & (
	| { type: 'authOrigin'; data: { origin: string } }
	| {
			type: 'transaction'
			broadcast: boolean
			data: TransactionPlan & { successPath?: string }
	  }
)

export type MessageInputOfType<T extends MessageInput['type']> = Extract<
	MessageInput,
	{ type: T }
>

export type MessageOfType<T extends Message['type']> = Extract<
	Message,
	{ type: T }
>

export enum MessageStatus {
	Failed = 'failed',
	Published = 'published',
	Rejected = 'rejected',
	RejectedForever = 'rejected_forever',
	Signed = 'signed',
	UnApproved = 'unapproved',
}

export type Message = {
	account: PreferencesAccount
	connectionId: string
	extUuid: unknown
	id: string
	timestamp: number
	title?: string | null
	origin: string
} & (
	| {
			status:
				| typeof MessageStatus.Published
				| typeof MessageStatus.Rejected
				| typeof MessageStatus.RejectedForever
				| typeof MessageStatus.Signed
				| typeof MessageStatus.UnApproved
	  }
	| {
			err: string
			status: typeof MessageStatus.Failed
	  }
) &
	(
		| {
				type: 'authOrigin'
				result?: { approved: 'OK' }
		  }
		| {
				type: 'transaction'
				broadcast: boolean
				data: TransactionPlan
				input: MessageInputOfType<'transaction'>
				result?: TransactionResponse
				successPath?: string | null
		  }
	)

export type TransactionResponse = {
	id: number
	jsonrpc: string
	result: {
		code: 1 | 0
		codespace: string
		data: string
		hash: string
		log: string
	}
}
