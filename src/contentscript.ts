import pipe from 'callbag-pipe'
import subscribe from 'callbag-subscribe'
import {
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
						postMessage({ penumbraMethod: BALANCE }, location.origin)
					} else {
						postMessage({ penumbraMethod: STATE }, location.origin)
					}
				})
			},
		})
	)
}

const onPageRequest = async (event: MessageEvent) => {
  // TODO: confirmation of sender
  if (event.data?.type === "BUF_TRANSPORT_REQUEST") {
    console.log("Content onPageRequest", event);
    chrome.runtime.sendMessage(event.data);
  }
};
window.addEventListener("message", onPageRequest);

type MessageSender = chrome.runtime.MessageSender;
const onExtensionResponse = async (message: any, sender: MessageSender) => {
  // TODO: confirmation of sender
  if (message.type === "BUF_TRANSPORT_RESPONSE") {
    console.log("Content onExtensionResponse", message, sender);
    window.postMessage(message);
  }
};
chrome.runtime.onMessage.addListener(onExtensionResponse);
