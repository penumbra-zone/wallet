import pipe from 'callbag-pipe'
import subscribe from 'callbag-subscribe'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { createAccountsStore, createUpdateState } from './account'
import {
	createIpcCallProxy,
	extension,
	fromPort,
	handleMethodCallRequests,
} from './lib'
import './ui/main.css'
import { routesUi } from './ui/routesUi'
import backgroundService, {
	BackgroundGetStateResult,
	BackgroundUiApi,
} from './ui/services/Background'

const isNotificationWindow = window.location.pathname === '/notification.html'

startUi()

async function startUi() {
	console.log('popup')
	const store = createAccountsStore()

	const router = createMemoryRouter(routesUi)

	const root = document.getElementById('app-content')
	invariant(root)

	createRoot(root).render(
		<Provider store={store} children={<RouterProvider router={router} />} />
	)

	const updateState = createUpdateState(store)

	extension.storage.onChanged.addListener(async (changes, area) => {
		if (area !== 'local') return

		const stateChanges: Partial<Record<string, unknown>> &
			Partial<BackgroundGetStateResult> = await backgroundService.getState([
			'isInitialized',
			'isLocked',
		])

		for (const key in changes) {
			stateChanges[key] = changes[key].newValue
		}
		updateState(stateChanges)
	})

	const connect = () => {
		const uiApi = {
			closePopupWindow: async () => {
				const popup = extension.extension
					.getViews({ type: 'popup' })
					.find(w => w.location.pathname === '/popup.html')
				if (popup) {
					popup.close()
				}
			},
		}
		let port: chrome.runtime.Port | null = extension.runtime.connect()
		pipe(
			fromPort(port),
			handleMethodCallRequests(uiApi, res => port.postMessage(res)),
			subscribe({
				complete: () => {
					backgroundService.setConnect(() => {
						port = null
						backgroundService.init(connect())
					})
				},
			})
		)
		return createIpcCallProxy<keyof BackgroundUiApi, BackgroundUiApi>(
			request => port?.postMessage(request),
			fromPort(port)
		)
	}
	const background = connect()

	// If popup is opened close notification window
	if (extension.extension.getViews({ type: 'popup' }).length > 0) {
		await background.closeNotificationWindow()
	}

	if (
		isNotificationWindow &&
		!window.matchMedia('(display-mode: fullscreen)').matches
	) {
		background.resizeNotificationWindow(
			400 + window.outerWidth - window.innerWidth,
			600 + window.outerHeight - window.innerHeight
		)
	}

	const [selectedAccount, networks, state] = await Promise.all([
		background.getSelectedAccount(),
		background.getNetworks(),
		background.getState(),
	])

	if (!selectedAccount) {
		background.showTab(window.location.origin + '/accounts.html', 'accounts')
	}
	updateState({
		selectedAccount,
		networks,
		contacts: state.contacts,
		messages: state.messages,
		origins: state.origins,
		...state,
	})

	backgroundService.init(background)

	document.addEventListener('mousemove', () => backgroundService.updateIdle())
	document.addEventListener('keyup', () => backgroundService.updateIdle())
	document.addEventListener('mousedown', () => backgroundService.updateIdle())
	document.addEventListener('focus', () => backgroundService.updateIdle())
}
