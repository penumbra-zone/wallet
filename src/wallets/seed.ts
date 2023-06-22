import {
	generate_spend_key,
	get_address_by_index,
	get_full_viewing_key,
	get_short_address_by_index,
} from 'penumbra-wasm'
import { WalletPrivateDataOfType } from './types'
import { Wallet } from './wallet'

export interface ISeedWalletInput {
	seed: string
	name: string
}

export class SeedWallet extends Wallet<WalletPrivateDataOfType<'seed'>> {
	constructor({ seed, name }: ISeedWalletInput) {
		super({
			seed,
			type: 'seed',
			name,
		})
	}

	getAccount() {
		return {
			type: this.data.type,
			name: this.data.name,
			addressByIndex: this.getAddressByIndex(0),
			shortAddressByIndex: this.getShortAddressByIndex(0),
		}
	}

	getAddressByIndex(index: number) {
		return get_address_by_index(this.getFullViewingKey(), index)
	}

	getShortAddressByIndex(index: number) {
		return get_short_address_by_index(this.getFullViewingKey(), index)
	}

	getSeed() {
		return this.data.seed
	}

	getSpendKey() {
		return generate_spend_key(this.getSeed())
	}

	getFullViewingKey() {
		return get_full_viewing_key(this.getSpendKey())
	}
}
