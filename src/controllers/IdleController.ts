import ObservableStore from 'obs-store'
import { extension } from '../lib'
import { ExtensionStorage } from '../storage'
import { PreferencesController } from './PreferencesController'
import { VaultController } from './VaultController'

export class IdleController {
	private idleInterval
	private preferencesController
	private vaultController
	private store
	private lastUpdateIdle

	constructor({
		extensionStorage,
		preferencesController,
		vaultController,
	}: {
		extensionStorage: ExtensionStorage
		preferencesController: PreferencesController
		vaultController: VaultController
	}) {
		this.preferencesController = preferencesController
		this.idleInterval = preferencesController.store.getState().idleInterval
		this.vaultController = vaultController
		this.store = new ObservableStore(
			extensionStorage.getInitState({ lastUpdateIdle: Date.now() })
		)
		this.lastUpdateIdle = this.store.getState().lastUpdateIdle
		extensionStorage.subscribe(this.store)
		this.start()

		extension.alarms.onAlarm.addListener(({ name }) => {
			if (name === 'idle') {
				this.start()
			}
		})
	}

	setIdleInterval(interval: number) {
		this.lastUpdateIdle = Date.now()
		this.store.updateState({ lastUpdateIdle: this.lastUpdateIdle })
		this.idleInterval = interval * 60 * 1000
		this.preferencesController.setIdleInterval(this.idleInterval)
		this.start()
	}

	start() {
		this._tmrMode()
	}

	update() {
		this.lastUpdateIdle = Date.now()
		this.store.updateState({ lastUpdateIdle: this.lastUpdateIdle })
		this.start()
	}

	private _tmrMode() {
		if (!this.idleInterval) return

		const time = Date.now() - this.lastUpdateIdle - this.idleInterval

		if (time > 0) {
			this._lock()
		} else {
			extension.alarms.create('idle', {
				delayInMinutes: 5 / 60,
			})
		}
	}

	_lock() {
		this.vaultController.lock()
	}
}
