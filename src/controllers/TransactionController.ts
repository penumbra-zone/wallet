import {
	base64_to_bech32,
	build_tx,
	encode_tx,
	is_controlled_address,
	send_plan,
} from 'penumbra-web-assembly'
import {
	CHAIN_PARAMETERS_TABLE_NAME,
	FMD_PARAMETERS_TABLE_NAME,
	SPENDABLE_NOTES_TABLE_NAME,
} from '../lib'
import {
	ActionArrayType,
	ActionType,
	ParsedActions,
	TransactionMessageData,
	TransactionPlan,
	TransactionResponseType,
} from '../types/transaction'
import { IndexedDb } from '../utils'
import { bytesToBase64 } from '../utils/base64'
import { WasmViewConnector } from '../utils/WasmViewConnector'
import { NetworkController } from './NetworkController'
import { RemoteConfigController } from './RemoteConfigController'
import { WalletController } from './WalletController'

export class TransactionController {
	private indexedDb: IndexedDb
	private configApi
	private wasmViewConnector: WasmViewConnector

	constructor({
		indexedDb,
		getAccountFullViewingKey,
		setNetworks,
		getNetwork,
		getNetworkConfig,
		getAccountSpendingKey,
		getCustomGRPC,
		wasmViewConnector,
	}: {
		indexedDb: IndexedDb
		getAccountFullViewingKey: WalletController['getAccountFullViewingKeyWithoutPassword']
		getAccountSpendingKey: WalletController['getAccountSpendingKeyWithoutPassword']
		setNetworks: RemoteConfigController['setNetworks']
		getNetwork: NetworkController['getNetwork']
		getNetworkConfig: RemoteConfigController['getNetworkConfig']
		getCustomGRPC: NetworkController['getCustomGRPC']
		wasmViewConnector: WasmViewConnector
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
		this.wasmViewConnector = wasmViewConnector
	}

	async parseActions2(actions: ActionArrayType[]): Promise<ParsedActions[]> {
		let fvk
		try {
			fvk = this.configApi.getAccountFullViewingKey()
		} catch {}
		if (!fvk) return

		return Promise.all(
			actions.map(async (i: ActionArrayType) => {
				const key = Object.keys(i)[0]
				const value = Object.values(i)[0]

				const amount =
					Number(
						key === 'spend' ? value.note.value.amount.lo : value.value.amount.lo
					) /
					10 ** 6

				const assetId =
					key === 'spend'
						? value.note.value.assetId.inner
						: value.value.assetId.inner

				const destAddress = key === 'spend' ? '' : value.destAddress.inner

				const detailAsset = await this.indexedDb.getValue('assets', assetId)

				const asset = detailAsset.denom.denom

				//encode recipinet address
				const encodeRecipientAddress = destAddress
					? base64_to_bech32('penumbrav2t', destAddress)
					: ''
				//check is recipient address is exist for current user
				let isOwnAddress: undefined | { inner: string }
				try {
					if (key !== 'spend')
						isOwnAddress = is_controlled_address(fvk, encodeRecipientAddress)
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
		)
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

				const amount =
					Number(
						key === 'spend' ? value.note.value.amount.lo : value.value.amount.lo
					) /
					10 ** 6

				const assetId =
					key === 'spend'
						? value.note.value.assetId.inner
						: value.value.assetId.inner

				const destAddress = key === 'spend' ? '' : value.destAddress.inner

				const detailAsset = await this.indexedDb.getValue('assets', assetId)

				const asset = detailAsset.denom.denom

				//encode recipinet address
				const encodeRecipientAddress = destAddress
					? base64_to_bech32('penumbrav2t', destAddress)
					: ''
				//check is recipient address is exist for current user
				let isOwnAddress: undefined | { inner: string }
				try {
					if (key !== 'spend')
						isOwnAddress = is_controlled_address(fvk, encodeRecipientAddress)
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

	async getTransactionPlan(
		destAddress: string,
		amount: number,
		assetId: string
	): Promise<{
		transactionPlan: TransactionPlan
		actions: ParsedActions[]
	}> {
		let fvk
		try {
			fvk = this.configApi.getAccountFullViewingKey()
		} catch {}
		if (!fvk) return

		let notes = await this.indexedDb.getAllValue(SPENDABLE_NOTES_TABLE_NAME)
		notes = notes
			.filter(note => note.heightSpent === undefined)
			.filter(note => note.note.value.assetId.inner === assetId)
		if (!notes.length) console.error('No notes found to spend')

		const fmdParameters = await this.indexedDb.getValue(
			FMD_PARAMETERS_TABLE_NAME,
			`fmd`
		)
		if (!fmdParameters) console.error('No found FmdParameters')

		const chainParamsRecords = await this.indexedDb.getAllValue(
			CHAIN_PARAMETERS_TABLE_NAME
		)
		const chainParameters = await chainParamsRecords[0]
		if (!chainParameters) console.error('No found chain parameters')

		const data = {
			notes,
			chain_parameters: chainParameters,
			fmd_parameters: fmdParameters,
		}

		const valueJs = {
			amount: {
				lo: amount * 1000000,
				hi: 0n,
			},
			assetId: notes[0].note.value.assetId,
		}

		const transactionPlan = send_plan(fvk, valueJs, destAddress, data)
		const actions = await this.parseActions2(transactionPlan.actions)

		return { transactionPlan, actions }
	}

	async sendTransaction(
		sendPlan: TransactionPlan
	): Promise<TransactionResponseType> {
		let fvk
		let spendingKey
		try {
			fvk = this.configApi.getAccountFullViewingKey()
			spendingKey = this.configApi.getAccountSpendingKey()
		} catch {}
		if (!fvk || !spendingKey) return

		const storedTree = await this.wasmViewConnector.loadStoredTree()
		const buildTx = build_tx(spendingKey, fvk, sendPlan, storedTree)
		const encodeTx = await encode_tx(buildTx)

		const resp = await this.broadcastTx(bytesToBase64(encodeTx))

		return resp

		// if (resp.result.code === 0) {
		//     extension.notifications.create(resp.id, {
		//       type: 'basic',
		//       iconUrl: 'assets/img/logo.png',
		//       title: 'Transaction Confirmed',
		//       message:
		//         'Transaction with hash 0x' +
		//         resp.result.hash +
		//         ' successfully confirmed',
		//       priority: 1,
		//     });
		// } else  {
		//     extension.notifications.create(resp.id, {
		//       type: 'basic',
		//       iconUrl: 'assets/img/logo.png',
		//       title: 'Transaction Error',
		//       message:
		//         'Error submitting transaction: code ' +
		//         resp.result.code +
		//         ', log: ' +
		//         resp.result.log,
		//       priority: 1,
		//     });
		// }

		// const tendermint = createPromiseClient(TendermintProxyService, transport);
		// let broadcastTxSyncRequest = new BroadcastTxSyncRequest();
		// broadcastTxSyncRequest.params = encodeTx;
		// broadcastTxSyncRequest.reqId = BigInt(id)
		// let broadcastTxSync = await tendermint.broadcastTxSync(broadcastTxSyncRequest);
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

	async broadcastTx(tx_bytes_hex: string) {
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
