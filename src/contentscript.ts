import pipe from 'callbag-pipe'
import subscribe from 'callbag-subscribe'
import { BALANCE, extension, filterIpcRequests, fromPort, fromPostMessage, STATE, STATUS } from './lib'



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

					console.log(data);
					
					
					if (data.lastBlockHeight && data.lastSavedBlock) {
						postMessage(
							{ penumbraMethod: STATUS },
							location.origin
						)
					} else if(data.balance){
						postMessage({penumbraMethod: BALANCE }, location.origin)
					} 
					else {
						postMessage(
							{ penumbraMethod: STATE },
							location.origin
						)
					}
				})
			},
		})
	)
}

// import LocalMessageDuplexStream from 'post-message-stream'
// import { extension, PortStream } from './lib'

// if (shouldInject()) {
// 	injectBundle()
// 	setupConnection()
// }

// function injectBundle() {
// 	const container = document.head || document.documentElement
// 	const script = document.createElement('script')
// 	script.src = extension.runtime.getURL('inpage.js')
// 	container.insertBefore(script, container.children[0])

// 	script.onload = () => {
// 		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
// 		script.parentElement!.removeChild(script)
// 	}
// }

// function setupConnection() {
// 	//stream from contentscript to inpage
// 	const inpageStream = new LocalMessageDuplexStream({
// 		name: 'penumbra_content',
// 		target: 'penumbra_page',
// 	})

// 	extension.storage.onChanged.addListener(changedData => {
// 		if (changedData.lastBlockHeight && changedData.lastSavedBlock) {
// 			inpageStream.write({ name: 'updateStatus' })
// 		} else {
// 			inpageStream.write({ name: 'updatePublicState' })
// 		}
// 	})

// 	const connect = () => {
// 		//stream from contentscript to background
// 		const backgroundPort = extension.runtime.connect({ name: 'contentscript' })
// 		const backgroundStream = new PortStream(backgroundPort)

// 		//stream from inpage to background
// 		inpageStream.pipe(backgroundStream).pipe(inpageStream)

// 		const onDisconnect = (port: chrome.runtime.Port) => {
// 			port.onDisconnect.removeListener(onDisconnect)
// 			// delete stream inpage to background
// 			inpageStream.unpipe(backgroundStream)
// 			// delete stream background to inpage
// 			backgroundStream.unpipe(inpageStream)

// 			backgroundStream.destroy()
// 			connect()
// 		}

// 		backgroundPort.onDisconnect.addListener(onDisconnect)
// 	}
// 	connect()
// }

// function shouldInject() {
// 	return doctypeCheck() && suffixCheck() && documentElementCheck()
// }

// function doctypeCheck() {
// 	const doctype = window.document.doctype
// 	if (doctype) {
// 		return doctype.name === 'html'
// 	} else {
// 		return true
// 	}
// }

// function suffixCheck() {
// 	const prohibitedTypes = ['xml', 'pdf']
// 	const currentUrl = window.location.href
// 	let currentRegex
// 	for (let i = 0; i < prohibitedTypes.length; i++) {
// 		currentRegex = new RegExp(`\\.${prohibitedTypes[i]}$`)
// 		if (currentRegex.test(currentUrl)) {
// 			return false
// 		}
// 	}
// 	return true
// }

// function documentElementCheck() {
// 	const documentElement = document.documentElement.nodeName
// 	if (documentElement) {
// 		return documentElement.toLowerCase() === 'html'
// 	}
// 	return true
// }
