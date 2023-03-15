import { IDBPDatabase, openDB } from 'idb'
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb'
import {
	ASSET_TABLE_NAME,
	CHAIN_PARAMETERS_TABLE_NAME,
	FMD_PARAMETERS_TABLE_NAME,
	SPENDABLE_NOTES_TABLE_NAME,
} from '../lib'

export type TableName =
	| typeof ASSET_TABLE_NAME
	| typeof CHAIN_PARAMETERS_TABLE_NAME
	| 'tx'
	| typeof FMD_PARAMETERS_TABLE_NAME
	| 'nct_commitments'
	| 'nct_forgotten'
	| 'nct_hashes'
	| 'nct_position'
	| typeof SPENDABLE_NOTES_TABLE_NAME
	| 'tx_by_nullifier'
	| 'swaps'

export class IndexedDb {
	private database: string
	private db: any
	private observer

	constructor() {
		this.database = 'penumbra'
		this.createObjectStore()
		this.observer = null
	}

	public async createObjectStore() {
		try {
			this.db = await openDB(this.database, 2, {
				upgrade(db: IDBPDatabase) {
					db.createObjectStore(ASSET_TABLE_NAME, {
						autoIncrement: true,
						keyPath: 'id.inner',
					})

					db.createObjectStore(CHAIN_PARAMETERS_TABLE_NAME, {
						autoIncrement: true,
						keyPath: 'chainId',
					})

					db.createObjectStore('tx', {
						keyPath: 'txHashHex',
					})

					db.createObjectStore(FMD_PARAMETERS_TABLE_NAME)

					db.createObjectStore('nct_commitments', {
						autoIncrement: true,
						keyPath: 'id',
					})

					db.createObjectStore('nct_forgotten')

					db.createObjectStore('nct_hashes', {
						autoIncrement: true,
						keyPath: 'id',
					})
					db.createObjectStore('nct_position')

					db.createObjectStore(SPENDABLE_NOTES_TABLE_NAME)

					db.createObjectStore('tx_by_nullifier', {
						autoIncrement: true,
						keyPath: 'nullifier',
					})

					db.createObjectStore('swaps')
				},
			})
		} catch (error) {
			return false
		}
	}

	public async getValue(tableName: TableName, id) {
		const tx = this.db.transaction(tableName, 'readonly')
		const store = tx.objectStore(tableName)
		const result = await store.get(id)
		return result
	}

	public async getAllValue(tableName: TableName) {
		const tx = this.db.transaction(tableName, 'readonly')
		const store = tx.objectStore(tableName)
		const result = await store.getAll()

		return result
	}

	public async putValue(tableName: TableName, value: object) {
		const tx = this.db.transaction(tableName, 'readwrite')
		const store = tx.objectStore(tableName)
		const result = await store.put(value)
		if (this.observer) {
			this.observer(tableName, value)
		}
		return result
	}

	public async putValueWithId(tableName: TableName, value: object, id) {
		const tx = this.db.transaction(tableName, 'readwrite')
		const store = tx.objectStore(tableName)
		const result = await store.put(value, id)
		if (this.observer) {
			this.observer(tableName, value)
		}
		return result
	}

	public async putBulkValue(tableName: TableName, values: object[]) {
		const tx = this.db.transaction(tableName, 'readwrite')
		const store = tx.objectStore(tableName)
		for (const value of values) {
			await store.put(value)
		}
		return this.getAllValue(tableName)
	}

	public async deleteValue(tableName: TableName, id: number) {
		const tx = this.db.transaction(tableName, 'readwrite')
		const store = tx.objectStore(tableName)
		const result = await store.get(id)
		if (!result) {
			console.error('Id not found', id)
			return result
		}
		await store.delete(id)
		return id
	}

	public async resetTables(tableName: string) {
		const tx = this.db.transaction([tableName], 'readwrite')
		const store = tx.objectStore(tableName)
		await store.clear()
	}

	addObserver(callback) {
		this.observer = callback
	}

	removeObserver() {
		this.observer = null
	}
}
