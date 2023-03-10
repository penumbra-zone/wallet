import ObservableStore from 'obs-store'
import { ExtensionStorage } from '../storage'
import { IAsset } from '../types/asset'

export class CurrentAccountController {
	private store
	constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
		this.store = new ObservableStore(
			extensionStorage.getInitState({
				balance: {},
			})
		)
		extensionStorage.subscribe(this.store)
	}

	async updateAssetBalance(assetId: string, amount: number) {
		const oldBalances = this.store.getState().balance

		const balance = (oldBalances[assetId] || 0) + amount
		const updatedBalances = {
			...oldBalances,
			[assetId]: balance,
		}

		this.store.updateState({ balance: updatedBalances })
	}
}
