import { createIpcCallProxy, fromPostMessage } from './lib'
import type { __BackgroundPageApiDirect } from './background'
import pipe from 'callbag-pipe'
import filter from 'callbag-filter'
import subscribe from 'callbag-subscribe'
import {
	AssetsResponse,
	BalanceByAddressRequest,
	BalanceByAddressResponse,
	ChainParametersResponse,
	FMDParametersResponse,
	NotesResponse,
	StatusResponse,
	StatusStreamResponse,
	TransactionInfoRequest,
	TransactionInfoResponse,
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
					| BalanceByAddressResponse
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
	getBalanceByAddress: (arg: BalanceByAddressRequest) =>
		proxy.getBalanceByAddress(arg),
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
			const data = await penumbra.getBalanceByAddress({} as any)
			for (let i = 0; i < data.length; i++) {
				cb(new BalanceByAddressResponse().fromJson(data[i] as any))
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
				}
				//  else if (event === 'state') {
				// 	const updatedValue = await penumbra.publicState()
				// 	cb(updatedValue)
				// }
				else if (event === 'balance') {
					const data = await penumbra.getBalanceByAddress({} as any)

					for (let i = 0; i < data.length; i++) {
						cb(new BalanceByAddressResponse().fromJson(data[i] as any))
						await timer(100)
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
