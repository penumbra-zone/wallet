import ObservableStore from 'obs-store'
import { ExtensionStorage, StorageLocalState } from '../storage'
import { PreferencesController } from './PreferencesController'
import { RemoteConfigController } from './RemoteConfigController'
import { uniq } from 'ramda'

const findPermissionFabric =
	(permission: PermissionType) => (item: PermissionType) =>
		item === permission

export const PERMISSIONS = {
	ALL: 'all',
	USE_API: 'useApi',
	USE_NOTIFICATION: 'useNotifications',
	REJECTED: 'rejected',
	APPROVED: 'approved',
	AUTO_SIGN: 'allowAutoSign',
	GET_MESSAGES: 'allowMessages',
	GET_CHAIN_CURRENT_STATUS: 'getChainCurrentStatus',
	GET_NOTES: 'getNotes',
	GET_QUARANTINED_NOTES: 'getQuarantinedNotes',
	GET_WITNESS: 'getWitness',
	GET_ASSETS: 'getAssets',
	GET_CHAIN_PARAMETERS: 'getChainParameters',
	GET_FMD_PARAMETERS: 'getFmdParameters',
	GET_NOTE_BY_COMMITMENT: 'getNoteByCommitment',
	GET_NULLIFIER_STATUS: 'getNullifierStatus',
	GET_TRANSACTIONS: 'getTransactionInfo',
	GET_TRANSACTION_PERSPECTIVE: 'getTransactionPerspective',
} as const

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

type PermissionsStoreState = Pick<
	StorageLocalState,
	'origins' | 'whitelist' | 'inPending'
>

export class PermissionController {
	private store
	private remoteConfig

	constructor({
		extensionStorage,
		remoteConfig,
	}: {
		extensionStorage: ExtensionStorage
		remoteConfig: RemoteConfigController
	}) {
		this.store = new ObservableStore(
			extensionStorage.getInitState({
				origins: {},
				whitelist: [],
				inPending: {},
			})
		)
		extensionStorage.subscribe(this.store)
		this.remoteConfig = remoteConfig
		this._updateByConfig()
	}

	getMessageIdAccess(origin: string) {
		const { inPending } = this.store.getState()
		return inPending[origin] || null
	}

	setMessageIdAccess(origin: string, messageId: string | null) {
		this.updateState({ inPending: { [origin]: messageId } })
	}

	setPermissions(origin: string, permissions: PermissionType[]) {
		this.setMessageIdAccess(origin, null)
		this.updateState({ origins: { [origin]: permissions } })
	}

	setPermission(origin: string, permission: PermissionType) {
		if (this.hasPermission(origin, permission)) {
			return null
		}

		const permissions = [...(this.getPermissions(origin) || [])]
		permissions.push(permission)
		this.setPermissions(origin, permissions)
	}

	deletePermission(origin: string, permission: PermissionType) {
		const permissions = this.getPermissions(origin).filter(
			i => i !== permission
		)
		this.setPermissions(origin, permissions)
	}

	getPermissions(origin: string) {
		const { origins, whitelist } = this.store.getState()
		const permissions = origins[origin] || []

		if (whitelist.includes(origin) && !permissions.includes(PERMISSIONS.ALL)) {
			return [...permissions, PERMISSIONS.ALL]
		}

		return permissions
	}

	getPermission(origin: string, permission: PermissionType) {
		const permissions = this.getPermissions(origin)
		const permissionType = permission
		const findPermission = findPermissionFabric(permissionType)
		return permissions.find(findPermission)
	}

	deletePermissions(origin: string) {
		const { origins, ...other } = this.store.getState()

		if (Object.prototype.hasOwnProperty.call(origins, origin)) {
			delete origins[origin]
		}

		this.store.updateState({ ...other, origins })
	}

	hasPermission(origin: string, permission: PermissionType) {
		const permissions = this.getPermissions(origin)

		if (!permissions.length) return null

		if (permissions.includes(PERMISSIONS.REJECTED))
			return permission === PERMISSIONS.REJECTED

		if (
			permissions.includes(PERMISSIONS.ALL) ||
			permissions.includes(permission)
		)
			return true

		return !!this.getPermission(origin, permission)
	}

	updateState(state: Partial<PermissionsStoreState>) {
		const {
			origins: oldOrigins,
			inPending: oldInPending,
			...oldState
		} = this.store.getState()
		const origins = { ...oldOrigins, ...(state.origins || {}) }
		const whitelist = state.whitelist || oldState.whitelist

		const inPending = { ...oldInPending, ...(state.inPending || {}) }
		Object.keys(origins).forEach(key => {
			origins[key] = uniq(origins[key] || [])
		})
		const newState = {
			...oldState,
			...state,
			origins,
			whitelist,
			inPending,
		}

		this.store.updateState(newState)
	}

	_updateBlackWhitelist() {
		const { whitelist } = this.store.getState()
		this._updatePermissionByList(whitelist, PERMISSIONS.APPROVED, 'whiteList')
	}

	_updatePermissionByList(
		list: string[],
		permission: PermissionType,
		type: 'whiteList'
	) {
		const { origins } = this.store.getState()
		const newOrigins = list.reduce(
			(acc, origin) => {
				const permissions = acc[origin] || []
				if (!permissions.includes(permission)) {
					permissions.push(permission)
				}

				if (!permissions.includes(type as any)) {
					permissions.push(type as any)
				}
				acc[origin] = permissions
				return acc
			},
			{ ...origins }
		)

		this.updateState({ origins: newOrigins })
	}

	_updateByConfig() {
		const { whitelist } = this.remoteConfig.store.getState()
		this.updateState({ whitelist })
		this.remoteConfig.store.subscribe(({ whitelist }) => {
			this.updateState({ whitelist })
			this._updateBlackWhitelist()
		})
	}

	clearStore() {
		this.store.updateState({
			...this.store.getState(),
			...{ origins: {}, whitelist: [], inPending: {} },
		})
	}
}
