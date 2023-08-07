import ObservableStore from 'obs-store'
import { DEFAULT_LEGACY_CONFIG } from '../lib'
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
import { Storage, runtime, storage } from 'webextension-polyfill'

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
		const storageState = storage.local

		const keysToRemove = (
			Object.keys(this._localState!) as Array<keyof StorageLocalState>
		).reduce<string[]>(
			(acc, key) => (this._state![key] ? acc : [...acc, key]),
			[]
		)
		await this._remove(storageState, keysToRemove)
	}

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
				storage.local.set(newState)
			})
		)
	}

	getState<K extends keyof StorageLocalState>(
		keys?: K | K[]
	): Pick<StorageLocalState, K> {
		if (!keys) {
			return this._state as any
		}

		if (typeof keys === 'string') {
			return { [keys]: this._state![keys] } as any
		}

		return keys.reduce(
			(acc, key) =>
				this._state![key] ? { ...acc, [key]: this._state![key] } : acc,
			{}
		) as Pick<StorageLocalState, K>
	}

	async get<K extends keyof StorageLocalState>(
		keys?: K | K[]
	): Promise<Pick<StorageLocalState, K>> {
		const storageState = storage.local
		return (await this._get(storageState, keys)) as Pick<StorageLocalState, K>
	}

	private async getSession(
		keys?: string | string[]
	): Promise<StorageSessionState> {
		const storageState = storage.session

		if (!storageState) return {}
		return await this._get(storageState, keys)
	}

	async set(state: StorageLocalState) {
		const storageState = storage.local
		this._state = { ...this._state, ...state }

		return this._set(storageState, state)
	}

	async setSession(state: StorageSessionState) {
		const storageState = storage.session

		if (!storageState) return

		return this._set(storageState, state)
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
		storageState: Storage.LocalStorageArea | Storage.StorageArea,
		keys?: string | string[]
	): Promise<Record<string, unknown>> {
		return new Promise((resolve, reject) => {
			storageState.get(keys).then(result => {
				const err = runtime.lastError
				err ? reject(err) : resolve(result)
			})
		})
	}

	private _set(
		storageState: Storage.LocalStorageArea | Storage.StorageArea,
		state: Record<string, unknown>
	): Promise<void> {
		return new Promise((resolve, reject) => {
			storageState.set(state).then(() => {
				const err = runtime.lastError
				err ? reject(err) : resolve()
			})
		})
	}

	private async _remove(
		storageState: Storage.LocalStorageArea,
		keys: string | string[]
	) {
		this.removeState(keys)
		await storageState.remove(keys)
	}
}
