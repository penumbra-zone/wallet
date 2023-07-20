
import {
	ActionArrayType,
	ActionType,
	TransactionMessageData,
	TransactionPlan,
} from '../types/transaction'
import { IndexedDb, penumbraWasm } from '../utils'
import { bytesToBase64 } from '../utils/base64'
import { NetworkController } from './NetworkController'
import { RemoteConfigController } from './RemoteConfigController'
import { WalletController } from './WalletController'
import { TransactionResponse } from '../messages/types'

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

	async getTransactionMessageData(
		transactionPlan: TransactionPlan
	): Promise<TransactionMessageData> {
		let fvk
		try {
			fvk = this.configApi.getAccountFullViewingKey()
		} catch {}
		if (!fvk) return
		let actions
		await Promise.all(
			transactionPlan.actions.map(async (i: ActionArrayType) => {
				const key = Object.keys(i)[0]
				const value = Object.values(i)[0]

				const assetId =
					key === 'spend'
						? value.note.value.assetId.inner
						: value.value.assetId.inner

				const detailAsset = await this.indexedDb.getValue('assets', assetId)

				const asset = detailAsset.display

				const exponent = Number(
					detailAsset?.denomUnits.find(i => i.denom === asset)?.exponent
				)

				const amount =
					Number(
						key === 'spend' ? value.note.value.amount.lo : value.value.amount.lo
					) / (exponent ? 10 ** exponent : 1)

				const destAddress = key === 'spend' ? '' : value.destAddress.inner

				//encode recipinet address
				const encodeRecipientAddress = destAddress
					? penumbraWasm.base64_to_bech32('penumbrav2t', destAddress)
					: ''
				//check is recipient address is exist for current user
				let isOwnAddress: undefined | { inner: string }
				try {
					if (key !== 'spend')
						isOwnAddress = penumbraWasm.is_controlled_address(fvk, encodeRecipientAddress)
				} catch (error) {
					console.error('is_controlled_address', error)
				}

				const type =
					key === 'output'
						? isOwnAddress
							? 'receive'
							: 'send'
						: (key as ActionType)

				return {
					type,
					amount,
					asset,
					isOwnAddress: key === 'spend' ? undefined : Boolean(isOwnAddress),
					destAddress: encodeRecipientAddress,
				}
			})
		).then(act => (actions = act))

		return { transactionPlan, actions }
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

		const buildTx = penumbraWasm.build_tx(spendingKey, fvk, sendPlan, storedTree)

		const encodeTx = await penumbraWasm.encode_tx(buildTx)

		const resp = await this.broadcastTx(bytesToBase64(encodeTx))

		return resp
	}

	getRandomInt() {
		return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
	}

	toHexString(bytes: Uint8Array) {
		return bytes.reduce(
			(str: string, byte: number) => str + byte.toString(16).padStart(2, '0'),
			''
		)
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
