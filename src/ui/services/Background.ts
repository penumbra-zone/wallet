import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'
import { __BackgroundUiApiDirect } from '../../background'
import { Contact, NetworkName, PermissionType } from '../../controllers'
import { TransactionResponse } from '../../messages/types'
import { StorageLocalState } from '../../storage'
import { TableName } from '../../utils'
import { CreateWalletInput, ISeedWalletInput } from '../../wallets'
import { PENUMBRAWALLET_DEBUG } from '../appConfig'

function prepareErrorMessage(err: any) {
	return err && err.message ? err.message : String(err)
}

export type BackgroundUiApi = __BackgroundUiApiDirect

class Background {
	static instance: Background
	background: BackgroundUiApi
	initPromise: Promise<void>
	updatedByUser = false
	_connect: () => void
	_defer: {
		resolve?: () => void
		reject?: () => void
		promise?: Promise<unknown>
	}
	_lastUpdateIdle = 0
	_tmr: ReturnType<typeof setTimeout> | undefined

	constructor() {
		this._connect = () => undefined
		this._defer = {}
		this.initPromise = new Promise((res, rej) => {
			this._defer.resolve = res
			this._defer.reject = rej
		})
		this._defer.promise = this.initPromise
	}

	init(background: BackgroundUiApi) {
		this.background = background
		this._connect = () => undefined

		if (PENUMBRAWALLET_DEBUG) {
			;(global as any).background = background
		}

		this._defer.resolve!()
	}

	setConnect(connect: () => void) {
		this._connect = connect
	}

	async getState<K extends keyof StorageLocalState>(params?: K[]) {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.getState(params)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async updateIdle() {
		this.updatedByUser = true
		this._updateIdle()
	}

	async setIdleInterval(interval: number) {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.setIdleInterval(interval)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async deleteOrigin(origin: string) {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.deleteOrigin(origin)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async setPermission(origin: string, permission: PermissionType) {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.setPermission(origin, permission)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async deletePermission(origin: string, permission: PermissionType) {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.deletePermission(origin, permission)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async selectAccount(lastAccount: ISeedWalletInput): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.selectAccount(lastAccount)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async addWallet(data: CreateWalletInput) {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.addWallet(data)
		} catch (err) {
			console.error(err)
			throw new Error(prepareErrorMessage(err))
		}
	}

	async deleteVault() {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.deleteVault()
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async closeNotificationWindow(): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.closeNotificationWindow()
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async showTab(url: string, name: string): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.showTab(url, name)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async lock(): Promise<void> {
		try {
			await this.initPromise
			await this._connect!()
			return await this.background!.lock()
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async resetWallet(): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.resetWallet()
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async unlock(password: string): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.unlock(password)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async initVault(password: string): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.initVault(password)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async getAccountSeed(password: string): Promise<string> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.getAccountSeed(password)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async getAccountFullViewingKey(password: string): Promise<string> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.getAccountFullViewingKey(password)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async getAccountSpendingKey(password: string): Promise<string> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.getAccountSpendingKey(password)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}
	async getCompactBlockRange(): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.getCompactBlockRange()
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async sendTransaction(
		sendPlan: TransactionPlan
	): Promise<TransactionResponse> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.sendTransaction(sendPlan)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async getValueById(tableName: TableName, id: string) {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.getValueById(tableName, id)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async deleteMessage(id: string): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.deleteMessage(id)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async approve(messageId: string, result?: any): Promise<unknown> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.approve(messageId, result)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async clearMessages(): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.clearMessages()
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async reject(messageId: string, forever = false): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.reject(messageId, forever)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async setCustomGRPC(
		url: string | null | undefined,
		network: NetworkName
	): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.setCustomGRPC(url, network)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async setCustomTendermint(
		code: string | undefined,
		network: NetworkName
	): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.setCustomTendermint(code, network)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async setContact(contact: Contact): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.setContact(contact)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async updateContact(contact: Contact, prevAddress: string): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.updateContact(contact, prevAddress)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async removeContact(address: string): Promise<void> {
		try {
			await this.initPromise

			await this._connect!()

			return await this.background!.removeContact(address)
		} catch (err) {
			throw new Error(prepareErrorMessage(err))
		}
	}

	async _updateIdle() {
		const now = Date.now()

		if (this._tmr != null) {
			clearTimeout(this._tmr)
		}

		this._tmr = setTimeout(() => this._updateIdle(), 4000)

		if (!this.updatedByUser || now - this._lastUpdateIdle < 4000) {
			return null
		}

		this.updatedByUser = false
		this._lastUpdateIdle = now
		await this.initPromise

		await this._connect!()

		return this.background!.updateIdle()
	}
}

export default new Background()

export type BackgroundGetStateResult = Awaited<
	ReturnType<Background['getState']>
>
