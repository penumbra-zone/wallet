import { createIpcCallProxy, fromPostMessage } from './lib'
import type { __BackgroundPageApiDirect } from './background'
import pipe from 'callbag-pipe'
import filter from 'callbag-filter'
import subscribe from 'callbag-subscribe'

type Events = 'update' | 'status'

declare global {
	interface PenumbraApi extends __BackgroundPageApiDirect {
		on(
			event: Events,
			cd: (
				state: Awaited<
					ReturnType<
						| __BackgroundPageApiDirect['publicState']
						| __BackgroundPageApiDirect['getStatus']
					>
				>
			) => void
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
	getStatusStream: proxy.getStatusStream,
	resourceIsApproved: proxy.resourceIsApproved,
	getAssets: proxy.getAssets,
	getChainParameters: proxy.getChainParameters,
	getNotes: proxy.getNotes,
	getNoteByCommitment: proxy.getNoteByCommitment,
	// getStatus: proxy.getStatus,
	getTransactionHashes: proxy.getTransactionHashes,
	getTransactionByHash: proxy.getTransactionByHash,
	getTransactions: proxy.getTransactions,
	getFmdParameters: proxy.getFmdParameters,
	get initialPromise() {
		return Promise.resolve(globalThis.penumbra)
	},
	on: (event: Events, cb) => {
		const penumbraMethod =
			event === 'status' ? 'updateStatus' : 'updatePublicState'

		pipe(
			fromPostMessage(),
			filter((data: { penumbraMethod: string }) => {
				return data.penumbraMethod === penumbraMethod
			}),
			subscribe(async data => {
				console.log(data)

				const isApproved = await penumbra.resourceIsApproved()
				if (!isApproved) return
				if (event === 'status') {
					const updatedValue = await proxy.getStatus()
					cb(updatedValue)
				} else if (event === 'update') {
					const updatedValue = await penumbra.publicState()
					cb(updatedValue)
				}
			})
		)
	},
}
