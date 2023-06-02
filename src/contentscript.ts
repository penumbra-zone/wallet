import pipe from 'callbag-pipe'
import subscribe from 'callbag-subscribe'
import {
	ACCOUNTS_CHANGED,
	BALANCE,
	extension,
	filterIpcRequests,
	fromPort,
	fromPostMessage,
	STATE,
	STATUS,
} from './lib'

if (document.documentElement.tagName === 'HTML') {
	const getPort = (() => {
		let port
		return () => {
			if (!port) {
				port = extension.runtime.connect({ name: 'contentscript' })

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
			src: extension.runtime.getURL('inpage.js'),
			onload: () => {
				pipe(
					fromPostMessage(),
					filterIpcRequests,
					subscribe(data => {
						getPort().postMessage(data)
					})
				)

				extension.storage.onChanged.addListener(data => {
					if (data.lastBlockHeight && data.lastSavedBlock) {
						postMessage({ penumbraMethod: STATUS }, location.origin)
					} else if (data.balance) {
						//TODO find asset as changed

						postMessage({ penumbraMethod: BALANCE }, location.origin)
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
