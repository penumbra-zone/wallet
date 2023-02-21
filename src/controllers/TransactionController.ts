import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb'
import { createGrpcWebTransport } from '@bufbuild/connect-web'
import { encode } from 'bech32-buffer'
import {
	base64_to_bech32,
	build_tx,
	encode_tx,
	is_controlled_address,
	send_plan,
} from 'penumbra-web-assembly'
import {
	ActionType,
	ParsedActions,
	TransactionPlanType,
} from '../types/transaction'
import { IndexedDb } from '../utils'
import { base64ToBytes, bytesToBase64 } from '../utils/base64'
import { WasmViewConnector } from '../utils/WasmViewConnector'
import { NetworkController } from './NetworkController'
import { RemoteConfigController } from './RemoteConfigController'
import { WalletController } from './WalletController'

export class TransactionController {
	indexedDb: IndexedDb
	private configApi
	private wasmViewConnector

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

	async parseActions(
		actions: ActionType[],
		fvk: string
	): Promise<ParsedActions[]> {
		return Promise.all(
			actions.map(async (i: ActionType) => {
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

				//find asset name
				const encodeAssetId = encode(
					'passet',
					base64ToBytes(assetId),
					'bech32m'
				)
				const detailAsset = await this.indexedDb.getValue(
					'assets',
					encodeAssetId
				)
				const asset = detailAsset.denom.denom

				//encode recipinet address
				const encodeRecipientAddress = destAddress
					? base64_to_bech32('penumbrav2t', destAddress)
					: ''
				//check is recipient address is exist for current user
				let isOwnAddress: undefined | { inner: string }
				try {
					if (key !== 'spend') {
						isOwnAddress = is_controlled_address(fvk, encodeRecipientAddress)
					}
				} catch (error) {
					console.log('is_controlled_address', error)
				}

				return {
					label: key === 'output' ? (isOwnAddress ? 'receive' : 'send') : key,
					amount,
					asset,
					isOwnAddress: key === 'spend' ? undefined : Boolean(isOwnAddress),
					recipient: encodeRecipientAddress,
				}
			})
		)
	}

	async getTransactionPlan(
		destAddress: string,
		amount: number,
		assetId: string
	): Promise<{
		transactionPlan: TransactionPlanType
		actions: ParsedActions[]
	}> {
		let fvk
		let spending_key
		try {
			fvk = this.configApi.getAccountFullViewingKey()
			spending_key = this.configApi.getAccountSpendingKey()
		} catch (error) {
			fvk = ''
		}

		if (!fvk) {
			return
		}

		const transactionPlan = {
			actions: [
				{
					output: {
						value: {
							amount: {
								lo: '1000000',
							},
							assetId: {
								inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
							},
						},
						destAddress: {
							inner:
								'3iv0Cm4pCQYyHber+XRJoWzYEtsf0X9ALoUP+lC6lNPXuWaE9On5QSu1zhWhDx1W1XznPAkjvUGtGkWPm4uKGOyHvWa5Vh0FmtlbS4LUGMQ=',
						},
						rseed: 'nOAVUV3t6pmn8kKu5HobmiBNqi7bfp+swoTxLEWCYvA=',
						valueBlinding: 'TGqx7/xAk1PuGOLTxR6eC4ECnujM3dDOWkH9+8PkjgM=',
					},
				},
				{
					spend: {
						note: {
							value: {
								amount: {
									lo: '999000000',
								},
								assetId: {
									inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
								},
							},
							rseed: 'bBynjvZozmXa79AyrhAIkJc0br0rUj/TFsMktPe2nWY=',
							address: {
								inner:
									'ppZYRg/x9IvKYbKfKXXZATPWJywLfDtImP/5QC8s5wmiyLU6SaQFDgr+raMI+/lNuOj9onDxCDGUV+BkFoLDNzFiGVXzmSVH8YUqhvMKOWo=',
							},
						},
						position: '90221903873',
						randomizer: 'iuJnEZsTqF2JEL5VNpxEW3bMa+o+WisAe+vCD3RRxgI=',
						valueBlinding: '4GVwfalfxmDBEaZKtf2KZW9YFlfbxYigxePT2QzsuwE=',
					},
				},
				{
					output: {
						value: {
							amount: {
								lo: '998000000',
							},
							assetId: {
								inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
							},
						},
						destAddress: {
							inner:
								'ppZYRg/x9IvKYbKfKXXZATPWJywLfDtImP/5QC8s5wmiyLU6SaQFDgr+raMI+/lNuOj9onDxCDGUV+BkFoLDNzFiGVXzmSVH8YUqhvMKOWo=',
						},
						rseed: 'G3N89005k5AYbKHz3MCUgAG+/LEyTXAQd9q0WgGdkUE=',
						valueBlinding: 'hQNn+C44I8KpJCck9F5LF1jg5dIH11EoDaO2mb0cRgQ=',
					},
				},
			] as ActionType[],
			chainId: 'penumbra-testnet-adraste',
			fee: {
				amount: {} as any,
			},
			cluePlans: [
				{
					address: {
						inner:
							'3iv0Cm4pCQYyHber+XRJoWzYEtsf0X9ALoUP+lC6lNPXuWaE9On5QSu1zhWhDx1W1XznPAkjvUGtGkWPm4uKGOyHvWa5Vh0FmtlbS4LUGMQ=',
					},
					rseed: 'G4M8W2UwslquVJeFI0YEjK1xYKXs6gAapONyBA5Wx3M=',
				},
				{
					address: {
						inner:
							'ppZYRg/x9IvKYbKfKXXZATPWJywLfDtImP/5QC8s5wmiyLU6SaQFDgr+raMI+/lNuOj9onDxCDGUV+BkFoLDNzFiGVXzmSVH8YUqhvMKOWo=',
					},
					rseed: 'sYt4PXtqzD2Qm13H8kvYw+ks37Jkrv3mD4KHGoo1XWc=',
				},
			],
			memoPlan: {
				key: 'KKktzf2RPkr7GluYC9JHLLh1r0CXGP5RbLDU2ZBel7o=',
			},
		}

		const actions = await this.parseActions(transactionPlan.actions, fvk)

		return { transactionPlan, actions }

		let notes = await this.indexedDb.getAllValue('spendable_notes')

		notes = notes
			.filter(note => note.heightSpent === undefined)
			.filter(note => note.note.value.assetId.inner === assetId)

		if (notes.length === 0) {
			console.error('No notes found to spend')
		}

		let fmd_parameters: FmdParameters = await this.indexedDb.getValue(
			'fmd_parameters',
			`fmd`
		)

		if (fmd_parameters === undefined) {
			console.error('No found FmdParameters')
		}

		let chain_params_records = await this.indexedDb.getAllValue(
			'chainParameters'
		)
		let chain_parameters = await chain_params_records[0]

		if (fmd_parameters === undefined) {
			console.error('No found chain parameters')
		}

		let data = {
			notes,
			chain_parameters,
			fmd_parameters,
		}

		let sendPlan = send_plan(
			fvk,
			{
				amount: {
					lo: amount * 1000000,
					hi: 0n,
				},
				assetId: notes[0].note.value.assetId,
			},
			destAddress,
			data
		)

		return sendPlan
	}

	async sendTransaction(sendPlan: TransactionPlanType) {
		let fvk
		let spending_key
		try {
			fvk = this.configApi.getAccountFullViewingKey()
			spending_key = this.configApi.getAccountSpendingKey()
		} catch (error) {
			fvk = ''
		}

		if (!fvk) {
			return
		}

		const customGrpc =
			this.configApi.getCustomGRPC()[this.configApi.getNetwork()]

		const { grpc: defaultGrpc, chainId } =
			this.configApi.getNetworkConfig()[this.configApi.getNetwork()]

		const grpc = customGrpc || defaultGrpc

		const transport = createGrpcWebTransport({
			baseUrl: grpc,
		})

		let buildTx = build_tx(
			spending_key,
			fvk,
			sendPlan,
			await this.wasmViewConnector.loadStoredTree()
		)

		let encodeTx = await encode_tx(buildTx)

		let resp = await this.broadcastTx(bytesToBase64(encodeTx))

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

	toHexString(bytes: any) {
		return bytes.reduce(
			(str: any, byte: any) => str + byte.toString(16).padStart(2, '0'),
			''
		)
	}

	async broadcastTx(tx_bytes_hex: string) {
		const broadcastResponse = await fetch(
			'http://testnet.penumbra.zone:26657',
			{
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
			}
		)
		const content = await broadcastResponse.json()

		return content
	}
}
