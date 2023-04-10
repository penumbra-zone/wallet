import ReactDOM from 'react-dom/client'
import {
	cbToPromise,
	createIpcCallProxy,
	extension,
	fromPort,
	handleMethodCallRequests,
	PortStream,
	setupDnode,
	transformMethods,
} from '../lib'
import { createAccountsStore } from './store'
import backgroundService, {
	BackgroundGetStateResult,
	BackgroundUiApi,
} from '../ui/services/Background'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './routes'
import { createUpdateState } from './updateState'
import { Provider } from 'react-redux'
import '../ui/main.css'
import pipe from 'callbag-pipe'
import subscribe from 'callbag-subscribe'

startUi()

async function startUi() {
	console.log('account');
	
	const store = createAccountsStore()

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
    );
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

	const pageFromHash = window.location.hash.split('#')[1]

	const router = createMemoryRouter(routes, {
		initialEntries: [pageFromHash || '/'],
	})

	const root = ReactDOM.createRoot(
		document.getElementById('accounts') as HTMLElement
	)

	root.render(
		<Provider store={store}>
			<RouterProvider router={router} />
		</Provider>
	)
}
