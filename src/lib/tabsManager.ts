import { Tabs, tabs } from 'webextension-polyfill'
import { ExtensionStorage } from '../storage/storage'
import ObservableStore from 'obs-store'

export class TabsManager {
	private store

	constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
		this.store = new ObservableStore(
			extensionStorage.getInitState({ tabs: {} })
		)
		extensionStorage.subscribe(this.store)
	}

	async getOrCreate(url: string, key: string) {
		const { tabs: tabsFromState } = this.store.getState()

		const currentTab = tabsFromState[key]
		const tabProps: Tabs.UpdateUpdatePropertiesType = { active: true }
		if (url != currentTab?.url) {
			tabProps.url = url
		}

		return new Promise<void>((resolve, reject) => {
			try {
				tabs.get(currentTab?.id!)

				tabs.update(currentTab!.id!, tabProps)
			} catch (err) {
				reject(err)
			}
		}).catch(() =>
			tabs.create({ url }).then(tab =>
				this.store.updateState({
					tabs: { ...tabsFromState, [key]: { ...tab, url } },
				})
			)
		)
	}

	async closeCurrentTab() {
		tabs
			.query({ active: true, lastFocusedWindow: true })
			.then(tab => tab[0] && tabs.remove([tab[0].id!]))
	}
}
