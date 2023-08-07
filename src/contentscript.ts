import pipe from 'callbag-pipe'
import subscribe from 'callbag-subscribe'
import {
	ACCOUNTS_CHANGED,
	BALANCE,
	filterIpcRequests,
	fromPort,
	fromPostMessage,
	STATE,
	STATUS,
} from './lib'
import { getObjectChanges } from './utils'
import { runtime, storage } from 'webextension-polyfill'

if (document.documentElement.tagName === 'HTML') {
	const getPort = (() => {
		let port
		return () => {
			if (!port) {
				port = runtime.connect({ name: 'contentscript' })

				pipe(
					fromPort(port),
					subscribe({
						next: msg => {
							postMessage(msg, location.origin)
						},
						complete: () => {
							port = undefined
						},
					})
				)
			}
			return port
		}
	})()

	const container = document.head || document.documentElement
	container.appendChild(
		Object.assign(document.createElement('script'), {
			src: runtime.getURL('inpage.js'),
			onload: () => {
				pipe(
					fromPostMessage(),
					filterIpcRequests,
					subscribe(data => {
						getPort().postMessage(data)
					})
				)

				storage.onChanged.addListener(data => {
					if (data.lastBlockHeight || data.lastSavedBlock) {
						postMessage({ penumbraMethod: STATUS }, location.origin)
					} else if (data.balance) {
						postMessage(
							{
								penumbraMethod: BALANCE,
								data: getObjectChanges(
									data.balance.oldValue,
									data.balance.newValue
								),
							},
							location.origin
						)
					} else if (data.isLocked) {
						postMessage({ penumbraMethod: ACCOUNTS_CHANGED }, location.origin)
					} else if (data.origins) {
						if (
							(!data.origins.newValue[location.origin] &&
								data.origins.oldValue[location.origin]) ||
							(data.origins.newValue[location.origin] &&
								!data.origins.oldValue[location.origin])
						) {
							postMessage({ penumbraMethod: ACCOUNTS_CHANGED }, location.origin)
						}
					} else {
						postMessage({ penumbraMethod: STATE }, location.origin)
					}
				})
			},
		})
	)
}
