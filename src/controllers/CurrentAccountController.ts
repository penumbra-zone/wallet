import ObservableStore from 'obs-store'
import { ExtensionStorage } from '../storage'
import { IndexedDb } from '../utils'
import { ASSET_TABLE_NAME, SPENDABLE_NOTES_TABLE_NAME } from '../lib'
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb'

export class CurrentAccountController {
	private store
	private indexedDb: IndexedDb
	constructor({
		extensionStorage,
		indexedDb,
	}: {
		extensionStorage: ExtensionStorage
		indexedDb: IndexedDb
	}) {
		this.store = new ObservableStore(
			extensionStorage.getInitState({
				balance: {},
			})
		)
		extensionStorage.subscribe(this.store)
		this.indexedDb = indexedDb
	}

	addTokenBalance(tokenId: AssetId, amount: number) {
		const id = tokenId.toJson() as { inner: string }

		const balance = this.store.getState().balance || {}
		this.store.updateState({ balance: { ...balance, [id.inner]: amount } })
	}

	async updateAssetBalance() {
		const notes = await this.indexedDb.getAllValue(SPENDABLE_NOTES_TABLE_NAME)

		const assets = await this.indexedDb.getAllValue(ASSET_TABLE_NAME)

		const zeroBalance = assets.reduce((acc, i) => {
			const assetId = i.penumbraAssetId.inner
			acc[assetId] = 0
			return acc
		}, {})

		const filteredNotes = notes.filter(i => !i.heightSpent)

		const balance = filteredNotes.reduce((acc, i) => {
			const assetId = i.note.value.assetId.inner
			const assetAmount = Number(i.note.value.amount.lo)

			if (!acc[assetId]) {
				acc[assetId] = assetAmount
			} else {
				acc[assetId] = acc[assetId] + assetAmount
			}

			return acc
		}, zeroBalance)

		this.store.updateState({ balance })
	}

	async resetWallet() {
		await this.store.updateState({ balance: {} })
	}
}
