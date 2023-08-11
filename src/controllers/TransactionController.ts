import { IndexedDb } from '../utils'
import { bytesToBase64 } from '../utils/base64'
import { NetworkController } from './NetworkController'
import { RemoteConfigController } from './RemoteConfigController'
import { WalletController } from './WalletController'
import { TransactionResponse } from '../messages/types'
import { penumbraWasm } from '../utils/wrapperPenumbraWasm'
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'

export class TransactionController {
	private indexedDb: IndexedDb
	private configApi

	constructor({
		indexedDb,
		getAccountFullViewingKey,
		setNetworks,
		getNetwork,
		getNetworkConfig,
		getAccountSpendingKey,
		getCustomGRPC,
	}: {
		indexedDb: IndexedDb
		getAccountFullViewingKey: WalletController['getAccountFullViewingKeyWithoutPassword']
		getAccountSpendingKey: WalletController['getAccountSpendingKeyWithoutPassword']
		setNetworks: RemoteConfigController['setNetworks']
		getNetwork: NetworkController['getNetwork']
		getNetworkConfig: RemoteConfigController['getNetworkConfig']
		getCustomGRPC: NetworkController['getCustomGRPC']
	}) {
		this.configApi = {
			getAccountFullViewingKey,
			setNetworks,
			getNetwork,
			getNetworkConfig,
			getAccountSpendingKey,
			getCustomGRPC,
		}
		this.indexedDb = indexedDb
	}

	async sendTransaction(
		sendPlan: TransactionPlan
	): Promise<TransactionResponse> {
		let fvk
		let spendingKey
		try {
			fvk = this.configApi.getAccountFullViewingKey()
			spendingKey = this.configApi.getAccountSpendingKey()
		} catch {}
		if (!fvk || !spendingKey) return

		const storedTree = await this.indexedDb.loadStoredTree()

		const buildTx = penumbraWasm.build_tx(
			spendingKey,
			fvk,
			sendPlan,
			storedTree
		)

		const encodeTx = await penumbraWasm.encode_tx(buildTx)

		const resp = await this.broadcastTx(bytesToBase64(encodeTx))

		return resp
	}

	getRandomInt() {
		return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
	}

	async broadcastTx(tx_bytes_hex: string): Promise<TransactionResponse> {
		const { tendermint } =
			this.configApi.getNetworkConfig()[this.configApi.getNetwork()]

		const broadcastResponse = await fetch(tendermint, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				method: 'broadcast_tx_sync',
				params: [tx_bytes_hex],
				id: this.getRandomInt(),
			}),
		})
		const content = await broadcastResponse.json()

		return content
	}
}
