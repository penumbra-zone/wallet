import ObservableStore from 'obs-store'
import { Tabs, tabs } from 'webextension-polyfill'
import { ExtensionStorage, StorageLocalState } from '../storage/storage'

export class TabsManager {
	private store: ObservableStore<Pick<StorageLocalState, 'tabs'>>

	constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
		this.store = new ObservableStore(
			extensionStorage.getInitState({ tabs: {} })
		)
		extensionStorage.subscribe(this.store)
	}

	async getOrCreateTab(url: string, key: string) {
		const { tabs: savedTabs } = this.store.getState()

		const currentTab: Tabs.Tab | undefined = savedTabs[key]

		if (!currentTab) return await this.createTab(url, key)

		try {
			await tabs.get(currentTab.id)
			const tabProps = {
				active: true,
				url: url !== currentTab.url ? url : currentTab.url,
			}
			await tabs.update(currentTab.id, tabProps)
		} catch (error) {
			await this.createTab(url, key)
		}
	}

	async createTab(url: string, key: string) {
		const { tabs: savedTabs } = this.store.getState()
		const newtab = await tabs.create({ url })

		this.store.updateState({
			tabs: { ...savedTabs, [key]: { ...newtab, url } },
		})
	}
}
