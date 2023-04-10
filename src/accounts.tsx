import pipe from 'callbag-pipe'
import subscribe from 'callbag-subscribe'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { routes } from './account/routes'
import { createAccountsStore } from './account/store'
import { createUpdateState } from './account/updateState'
import {
	createIpcCallProxy,
	extension,
	fromPort,
	handleMethodCallRequests,
} from './lib'
import './ui/main.css'
import backgroundService, {
	BackgroundGetStateResult,
	BackgroundUiApi,
} from './ui/services/Background'

startUi()

async function startUi() {
	console.log('account')

	const store = createAccountsStore()

	const pageFromHash = window.location.hash.split('#')[1]

	const router = createMemoryRouter(routes, {
		initialEntries: [pageFromHash || '/'],
	})

	const root = document.getElementById('app-content')
	invariant(root)

	createRoot(root).render(
		<Provider store={store} children={<RouterProvider router={router} />} />
	)

	const updateState = createUpdateState(store)

	extension.storage.onChanged.addListener(async (changes, area) => {
		if (area !== 'local') {
			return
		}

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

	const [state, networks] = await Promise.all([
		background.getState(),
		background.getNetworks(),
	])

	updateState({ ...state, networks })

	backgroundService.init(background)

	document.addEventListener('mousemove', () => backgroundService.updateIdle())
	document.addEventListener('keyup', () => backgroundService.updateIdle())
	document.addEventListener('mousedown', () => backgroundService.updateIdle())
	document.addEventListener('focus', () => backgroundService.updateIdle())
}
