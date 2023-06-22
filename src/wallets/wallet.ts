import { WalletAccount } from '../preferences'
import { WalletPrivateData } from './types'

export abstract class Wallet<TData extends WalletPrivateData> {
	readonly data: TData
	constructor(data: TData) {
		this.data = data
	}

	abstract getAccount(): WalletAccount
	abstract getSeed(): string
	abstract getFullViewingKey(): string
	abstract getSpendKey(): string
	abstract getAddressByIndex(index: number): string

	serialize() {
		return this.data
	}
}
