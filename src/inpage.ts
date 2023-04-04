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
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb'

type Events =
	| 'state'
	| 'status'
	| 'balance'
	| 'assets'
	| 'transactions'
	| 'notes'

declare global {
	interface PenumbraApi extends __BackgroundPageApiDirect {
		on(
			event: Events,
			cb: (
				state:
					| Awaited<
							ReturnType<
								| __BackgroundPageApiDirect['publicState']
								| __BackgroundPageApiDirect['getStatusStream']
								| __BackgroundPageApiDirect['getTransactions']
							>
					  >
					| AssetsResponse
					| BalanceByAddressResponse
					| NotesResponse
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

//@ts-ignore
globalThis.penumbra = {
	signTransaction: proxy.signTransaction,
	publicState: proxy.publicState,
	getBalanceByAddress: (arg: BalanceByAddressRequest) =>
		proxy.getBalanceByAddress(arg),
	getChainParameters: async () =>
		new ChainParametersResponse().fromJson(
			(await proxy.getChainParameters()) as any
		),
	getNoteByCommitment: proxy.getNoteByCommitment,
	getStatus: async () =>
		new StatusResponse().fromJson((await proxy.getStatus()) as any),
	getTransactionHashes: proxy.getTransactionHashes,
	getTransactionByHash: proxy.getTransactionByHash,
	getTransactions: proxy.getTransactions,
	getFmdParameters: async () =>
		new FMDParametersResponse().fromJson(
			(await proxy.getFmdParameters()) as any
		),
	get initialPromise() {
		return Promise.resolve(globalThis.penumbra)
	},
	on: async (event, cb, args) => {
		const isApproved = await proxy.resourceIsApproved()
		if (!isApproved) return

		if (event === 'assets') {
			const data = await proxy.getAssets()
			for (let i = 0; i < data.length; i++) {
				cb(new AssetsResponse().fromJson(data[i] as any))
			}
		} else if (event === 'balance') {
			const data = await penumbra.getBalanceByAddress(args)
			for (let i = 0; i < data.length; i++) {
				cb(new BalanceByAddressResponse().fromJson(data[i] as any))
			}
		} else if (event === 'status') {
			const updatedValue = await proxy.getStatusStream()
			cb(new StatusStreamResponse().fromJson(updatedValue as any))
		} else if (event === 'notes') {
			const data = await proxy.getNotes()
			for (let i = 0; i < data.length; i++) {
				cb(new NotesResponse().fromJson(data[i] as any))
			}
		}

		pipe(
			fromPostMessage(),
			filter((data: { penumbraMethod: string }) => {
				return data.penumbraMethod === event.toUpperCase()
			}),
			subscribe(async data => {
				if (event === 'status') {
					const updatedValue = await proxy.getStatusStream()
					cb(new StatusStreamResponse().fromJson(updatedValue as any))
				} else if (event === 'state') {
					const updatedValue = await penumbra.publicState()
					cb(updatedValue)
				} else if (event === 'balance') {
					const updatedValue = await penumbra.getBalanceByAddress(args)

					for (let i = 0; i < updatedValue.length; i++) {
						cb(new BalanceByAddressResponse().fromJson(updatedValue[i] as any))
					}
				} else if (event === 'assets') {
					cb(new AssetsResponse().fromJson({ asset: (data as any).data }))
				} else if (event === 'notes') {
					cb(new NotesResponse().fromJson({ noteRecord: (data as any).data }))
				}
			})
		)
	},
}
