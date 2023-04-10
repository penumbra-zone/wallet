import ObservableStore from 'obs-store'
import { DEFAULT_LEGACY_CONFIG, extension } from '../lib'
import {
	Contact,
	NetworkConfigItem,
	NetworkName,
	PermissionType,
} from '../controllers'
import { PreferencesAccount } from '../preferences'
import { Message } from '../messages/types'
import pipe from 'callbag-pipe'
import create from 'callbag-create'
import subscribe from 'callbag-subscribe'

export type StorageLocalState = {
	contacts: Contact[]
	selectedAccount: PreferencesAccount | undefined
	isInitialized: boolean | null
	isLocked: boolean | null
	config: {
		networks: string[]
		network_config: NetworkConfigItem
		messages_config: typeof DEFAULT_LEGACY_CONFIG.MESSAGES_CONFIG
		pack_config: typeof DEFAULT_LEGACY_CONFIG.PACK_CONFIG
		idle: typeof DEFAULT_LEGACY_CONFIG.IDLE
	}
	lastUpdateIdle: number
	currentNetwork: NetworkName
	customTendermint: Record<NetworkName, string | null | undefined>
	customGRPC: Record<NetworkName, string | null | undefined>
	WalletController: {
		vault: string | undefined
	}
	lastSavedBlock: {
		mainnet: number
		testnet: number
	}
	lastBlockHeight: {
		mainnet: number
		testnet: number
	}
	origins: Record<string, PermissionType[]>
	whitelist: string[]
	inPending: Record<string, string | null>
	messages: Message[]
	notificationWindowId: number | undefined
	inShowMode: boolean | undefined
	idleInterval: number
	balance: Record<string, number>
}

export type StorageSessionState = {
	memo?: Record<string, string | null>
	password?: string | null | undefined
}

export class ExtensionStorage {
	private _state: Partial<StorageLocalState>
	private _localState: StorageLocalState
	private _sessionState: StorageSessionState

	async create() {
		this._localState = await this.get()
		this._sessionState = await this.getSession()
	}

	getInitState<
		K extends keyof StorageLocalState,
		F extends keyof StorageLocalState
	>(
		defaults: Pick<StorageLocalState, K> | StorageLocalState,
		forced?: Pick<StorageLocalState, F> | StorageLocalState
	): Pick<StorageLocalState, K>
	getInitState<T extends Record<string, unknown>>(defaults: T, forced?: T): T
	getInitState(
		defaults: Record<string, unknown>,
		forced?: Record<string, unknown>
	) {
		const defaultsInitState = Object.keys(defaults).reduce(
			(acc, key) =>
				Object.prototype.hasOwnProperty.call(this._localState, key)
					? // eslint-disable-next-line @typescript-eslint/no-explicit-any
					  { ...acc, [key]: (this._localState as any)[key] }
					: acc,
			{}
		)

		const initState = { ...defaults, ...defaultsInitState, ...(forced || {}) }
		this._state = { ...this._state, ...initState }
		return initState
	}

	getInitSession() {
		return this._sessionState
	}

	async clear() {
		const storageState = extension.storage.local

		const keysToRemove =
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			(Object.keys(this._localState!) as Array<keyof StorageLocalState>).reduce<
				string[]
			>(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				(acc, key) => (this._state![key] ? acc : [...acc, key]),
				[]
			)
		await this._remove(storageState, keysToRemove)
	}

	// subscribe(store: ObservableStore<unknown>) {
	// 	pump(
	// 		asStream(store),
	// 		debounceStream(200),
	// 		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 		createStreamSink(async (state: any) => {
	// 			if (!state) {
	// 				throw new Error('Updated state is missing')
	// 			}

	// 			try {
	// 				await this.set(
	// 					Object.entries(state).reduce(
	// 						(acc, [key, value]) => ({
	// 							...acc,
	// 							[key]: value === undefined ? null : value,
	// 						}),
	// 						{}
	// 					) as StorageLocalState
	// 				)
	// 			} catch (err) {
	// 				// log error so we dont break the pipeline
	// 				console.error('error setting state in local store:', err)
	// 			}
	// 		}),
	// 		error => {
	// 			console.error('Persistence pipeline failed', error)
	// 		}
	// 	)
	// }

	subscribe<T extends Record<string, unknown>>(store: ObservableStore<T>) {
		pipe(
			create<T>(next => store.subscribe(next)),
			subscribe(state => {
				const newState = Object.entries(state).reduce(
					(acc, [key, value]) => ({
						...acc,
						[key]: value === undefined ? null : value,
					}),
					{}
				)

				this._state = { ...this._state, ...newState }
				extension.storage.local.set(newState)
			})
		)
	}

	getState<K extends keyof StorageLocalState>(
		keys?: K | K[]
	): Pick<StorageLocalState, K> {
		if (!keys) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return this._state as any
		}

		if (typeof keys === 'string') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion
			return { [keys]: this._state![keys] } as any
		}

		return keys.reduce(
			(acc, key) =>
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this._state![key] ? { ...acc, [key]: this._state![key] } : acc,
			{}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		) as any
	}

	async get<K extends keyof StorageLocalState>(
		keys?: K | K[]
	): Promise<Pick<StorageLocalState, K>> {
		const storageState = extension.storage.local
		return (await this._get(storageState, keys)) as any
	}

	private async getSession(
		keys?: string | string[]
	): Promise<StorageSessionState> {
		const storageState = extension.storage.session

		if (!storageState) return {}
		return await this._get(storageState, keys)
	}

	async set(state: StorageLocalState) {
		const storageState = extension.storage.local
		this._state = { ...this._state, ...state }

		return this._set(storageState, state as any)
	}

	async setSession(state: StorageSessionState) {
		const storageState = extension.storage.session

		if (!storageState) return

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return this._set(storageState, state as any)
	}

	removeState(keys: string | string[]) {
		const state = this._state
		if (state) {
			if (typeof keys === 'string') {
				if (keys in state) {
					delete state[keys as keyof typeof state]
				}
			} else {
				keys.forEach(key => {
					if (key in state) {
						delete state[key as keyof typeof state]
					}
				})
			}
		}
	}

	private _get(
		storageState: chrome.storage.StorageArea,
		keys?: string | string[]
	): Promise<Record<string, unknown>> {
		return new Promise((resolve, reject) => {
			storageState.get(keys, result => {
				const err = extension.runtime.lastError
				err ? reject(err) : resolve(result)
			})
		})
	}

	private _set(
		storageState: chrome.storage.StorageArea,
		state: Record<string, unknown>
	): Promise<void> {
		return new Promise((resolve, reject) => {
			storageState.set(state, () => {
				const err = extension.runtime.lastError
				err ? reject(err) : resolve()
			})
		})
	}

	private async _remove(
		storageState: chrome.storage.StorageArea,
		keys: string | string[]
	) {
		this.removeState(keys)
		await storageState.remove(keys)
	}
}
