import { createIpcCallProxy, fromPostMessage } from './lib'
import type { __BackgroundPageApiDirect } from './background'
import pipe from 'callbag-pipe'
import filter from 'callbag-filter'
import subscribe from 'callbag-subscribe'
import { BalanceByAddressReq } from './types/viewService'

type Events = 'state' | 'status' | 'balance' | 'assets' | 'transactions'

declare global {
	interface PenumbraApi extends __BackgroundPageApiDirect {
		on(
			event: Events,
			cd: (
				state: Awaited<
					ReturnType<
						| __BackgroundPageApiDirect['publicState']
						| __BackgroundPageApiDirect['getStatusStream']
						| __BackgroundPageApiDirect['getBalanceByAddress']
						| __BackgroundPageApiDirect['getTransactions']
						| __BackgroundPageApiDirect['getAssets']
					>
				>
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
	publicState: proxy.publicState,
	getBalanceByAddress: (arg: BalanceByAddressReq) =>
		proxy.getBalanceByAddress(arg),
	getStatusStream: proxy.getStatusStream,
	resourceIsApproved: proxy.resourceIsApproved,
	getAssets: proxy.getAssets,
	getChainParameters: proxy.getChainParameters,
	getNotes: proxy.getNotes,
	getNoteByCommitment: proxy.getNoteByCommitment,
	getStatus: proxy.getStatus,
	getTransactionHashes: proxy.getTransactionHashes,
	getTransactionByHash: proxy.getTransactionByHash,
	getTransactions: proxy.getTransactions,
	getFmdParameters: proxy.getFmdParameters,
	get initialPromise() {
		return Promise.resolve(globalThis.penumbra)
	},
	on: async (event, cb, args) => {
		const isApproved = await penumbra.resourceIsApproved()
		if (!isApproved) return

		if (event === 'assets') {
			const data = await penumbra.getAssets()
			for (let i = 0; i < data.length; i++) {
				cb(data[i] as any)
			}
		}

		pipe(
			fromPostMessage(),
			filter((data: { penumbraMethod: string }) => {
				return data.penumbraMethod === event.toUpperCase()
			}),
			subscribe(async data => {
				if (event === 'status') {
					const updatedValue = await penumbra.getStatusStream()
					// console.log(new Uint8Array([1, 2, 3]))

					cb(updatedValue)
					// cb(new Uint8Array([1, 2, 3]) as any)
				} else if (event === 'state') {
					const updatedValue = await penumbra.publicState()
					cb(updatedValue)
				} else if (event === 'balance') {
					const updatedValue = await penumbra.getBalanceByAddress(args)
					for (let i = 0; i < updatedValue.length; i++) {
						cb(updatedValue[i] as any)
					}
				} else if (event === 'assets') {
					cb({ asset: (data as any).data } as any)
				}
			})
		)
	},
}
