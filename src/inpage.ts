import { createIpcCallProxy, fromPostMessage } from './lib'
import type { __BackgroundPageApiDirect } from './background'
import pipe from 'callbag-pipe'
import filter from 'callbag-filter'
import subscribe from 'callbag-subscribe'
import {
	AddressByIndexRequest,
	AddressByIndexResponse,
	AssetsResponse,
	BalancesRequest,
	BalancesResponse,
	ChainParametersResponse,
	FMDParametersResponse,
	NotesResponse,
	StatusResponse,
	StatusStreamResponse,
	TransactionInfoByHashRequest,
	TransactionInfoByHashResponse,
	TransactionInfoRequest,
	TransactionInfoResponse,
	TransactionPlannerRequest,
	TransactionPlannerResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb'

type Events =
	| 'state'
	| 'status'
	| 'balance'
	| 'assets'
	| 'transactions'
	| 'notes'
	| 'accountsChanged'

declare global {
	interface PenumbraApi extends __BackgroundPageApiDirect {
		removeListener(event: Events, cb)
		getTransactionInfoByHash(
			request: TransactionInfoByHashRequest
		): Promise<TransactionInfoByHashResponse>
		getAddressByIndex(
			request: AddressByIndexRequest
		): Promise<AddressByIndexResponse>
		getTransactionPlanner: (
			request: TransactionPlannerRequest
		) => Promise<TransactionPlannerResponse>
		on(
			event: Events,
			cb: (
				state:
					| Awaited<
							ReturnType<
								| __BackgroundPageApiDirect['requestAccounts']
								| __BackgroundPageApiDirect['getStatusStream']
								| __BackgroundPageApiDirect['getTransactionInfo']
							>
					  >
					| AssetsResponse
					| BalancesResponse
					| NotesResponse
					| TransactionInfoResponse
					| string[]
			) => void,
			args: any
		): void
		initialPromise: Promise<typeof penumbra>
	}

	var penumbra: PenumbraApi
}

const proxy = createIpcCallProxy<
	keyof __BackgroundPageApiDirect,
	__BackgroundPageApiDirect
>(request => postMessage(request, location.origin), fromPostMessage())

const timer = ms => new Promise(res => setTimeout(res, ms))

//@ts-ignore
globalThis.penumbra = {
	signTransaction: proxy.signTransaction,
	requestAccounts: proxy.requestAccounts,
	getFullViewingKey: proxy.getFullViewingKey,
	getBalances: (arg: BalancesRequest) => proxy.getBalances(arg),
	getChainParameters: async () =>
		new ChainParametersResponse().fromJson(
			(await proxy.getChainParameters()) as any
		),
	getNoteByCommitment: proxy.getNoteByCommitment,
	getStatus: async () =>
		new StatusResponse().fromJson((await proxy.getStatus()) as any),
	getTransactionInfo: proxy.getTransactionInfo,

	getFmdParameters: async () =>
		new FMDParametersResponse().fromJson(
			(await proxy.getFmdParameters()) as any
		),
	getTransactionInfoByHash: async request => {
		return new TransactionInfoByHashResponse().fromJson(
			await proxy.getTransactionInfoByHashProxy(request.toJsonString())
		)
	},
	getAddressByIndex: async request => {
		return new AddressByIndexResponse().fromJson(
			await proxy.getAddressByIndexProxy(request.toJsonString())
		)
	},
	getTransactionPlanner: async request => {
		return new TransactionPlannerResponse().fromJson(
			await proxy.getTransactionPlannerProxy(request.toJsonString())
		)
	},
	get initialPromise() {
		return Promise.resolve(globalThis.penumbra)
	},
	on: async (event, cb, args) => {
		const isApproved = await proxy.resourceIsApproved()
		if (!isApproved && event !== 'accountsChanged') return

		if (event === 'assets') {
			const data = await proxy.getAssets()

			for (let i = 0; i < data.length; i++) {
				cb(new AssetsResponse().fromJson(data[i] as any))
				await timer(100)
			}
		} else if (event === 'balance') {
			const data = await penumbra.getBalances(new BalancesRequest(args))

			for (let i = 0; i < data.length; i++) {
				cb(new BalancesResponse().fromJson(data[i] as any))
				await timer(100)
			}
		} else if (event === 'status') {
			const updatedValue = await proxy.getStatusStream()
			cb(new StatusStreamResponse().fromJson(updatedValue as any))
		} else if (event === 'notes') {
			const data = await proxy.getNotes()
			for (let i = 0; i < data.length; i++) {
				cb(new NotesResponse().fromJson(data[i] as any))
				await timer(100)
			}
		} else if (event === 'transactions') {
			const data = await proxy.getTransactionInfo(
				new TransactionInfoRequest(args)
			)

			for (let i = 0; i < data.length; i++) {
				cb(new TransactionInfoResponse().fromJson(data[i] as any))
				await timer(100)
			}
		} else if (event === 'accountsChanged') {
			const account = await proxy.getAccount()

			account.length && cb(account)
		}

		pipe(
			fromPostMessage(),
			filter((data: { penumbraMethod: string }) => {
				return data.penumbraMethod === event
			}),
			subscribe(async data => {
				if (event === 'status') {
					const updatedValue = await proxy.getStatusStream()
					cb(new StatusStreamResponse().fromJson(updatedValue as any))
				} else if (event === 'balance' && data.penumbraMethod === 'balance') {
					if (
						!args.assetIdFilter ||
						args.assetIdFilter.inner === Object.keys((data as any).data)[0]
					) {
						const balance = await penumbra.getBalances(
							new BalancesRequest({
								assetIdFilter: {
									inner: Object.keys((data as any).data)[0] as any,
								},
							})
						)

						for (let i = 0; i < balance.length; i++) {
							cb(new BalancesResponse().fromJson(balance[i] as any))
						}
					}
				} else if (event === 'assets') {
					cb(
						new AssetsResponse().fromJson({ denomMetadata: (data as any).data })
					)
				} else if (event === 'notes') {
					cb(new NotesResponse().fromJson({ noteRecord: (data as any).data }))
				} else if (event === 'transactions') {
					cb(
						new TransactionInfoResponse().fromJson({
							txInfo: (data as any).data,
						})
					)
					await timer(100)
				} else if (event === 'accountsChanged') {
					const account = await proxy.getAccount()

					cb(account)
				}
			})
		)
	},
}
