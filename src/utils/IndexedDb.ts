import { deleteDB, IDBPDatabase, openDB } from 'idb'
import {
	ASSET_TABLE_NAME,
	CHAIN_PARAMETERS_TABLE_NAME,
	FMD_PARAMETERS_TABLE_NAME,
	NCT_COMMITMENTS_TABLE_NAME,
	NCT_FORGOTTEN_TABLE_NAME,
	NCT_HASHES_TABLE_NAME,
	NCT_POSITION_TABLE_NAME,
	SPENDABLE_NOTES_TABLE_NAME,
	SWAP_TABLE_NAME,
	TRANSACTION_BY_NULLIFIER_TABLE_NAME,
	TRANSACTION_TABLE_NAME,
} from '../lib'

export type StoredTree = {
	last_position: number
	last_forgotten: number
	hashes: StoredHash[]
	commitments: StoredCommitment[]
}

export type StoredHash = {
	position: number
	height: number
	hash: Uint8Array
}

export type StoredCommitment = {
	position: number
	commitment: Uint8Array
}

export type TableName =
	| typeof ASSET_TABLE_NAME
	| typeof CHAIN_PARAMETERS_TABLE_NAME
	| typeof TRANSACTION_TABLE_NAME
	| typeof FMD_PARAMETERS_TABLE_NAME
	| typeof NCT_COMMITMENTS_TABLE_NAME
	| typeof NCT_FORGOTTEN_TABLE_NAME
	| typeof NCT_HASHES_TABLE_NAME
	| typeof NCT_POSITION_TABLE_NAME
	| typeof SPENDABLE_NOTES_TABLE_NAME
	| typeof TRANSACTION_BY_NULLIFIER_TABLE_NAME
	| typeof SWAP_TABLE_NAME

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
			this.db = await openDB(this.database, 10, {
				async upgrade(db: IDBPDatabase) {
					for (const objectStoreName of db.objectStoreNames) {
						db.deleteObjectStore(objectStoreName)
					}

					db.createObjectStore(ASSET_TABLE_NAME, {
						autoIncrement: true,
						keyPath: 'penumbraAssetId.inner',
					})

					db.createObjectStore(CHAIN_PARAMETERS_TABLE_NAME, {
						autoIncrement: true,
						keyPath: 'chainId',
					})

					db.createObjectStore(TRANSACTION_TABLE_NAME, {
						keyPath: 'id.hash',
					})

					db.createObjectStore(FMD_PARAMETERS_TABLE_NAME)

					db.createObjectStore(NCT_COMMITMENTS_TABLE_NAME, {
						autoIncrement: true,
						keyPath: 'id',
					})

					db.createObjectStore(NCT_FORGOTTEN_TABLE_NAME)

					db.createObjectStore(NCT_HASHES_TABLE_NAME, {
						autoIncrement: true,
						keyPath: 'id',
					})

					db.createObjectStore(NCT_POSITION_TABLE_NAME)

					db.createObjectStore(SPENDABLE_NOTES_TABLE_NAME)

					db.createObjectStore(TRANSACTION_BY_NULLIFIER_TABLE_NAME, {
						autoIncrement: true,
						keyPath: 'nullifier',
					})

					db.createObjectStore(SWAP_TABLE_NAME)
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
		// for (const value of values) {
		// 	await store.put(value)
		// }
		for (let i = 0; i < values.length; i++) {
			await store.put(values[i])
		}

		return ''
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

	public async resetTables(tableName: TableName) {
		const tx = this.db.transaction([tableName], 'readwrite')
		const store = tx.objectStore(tableName)
		await store.clear()
	}

	private getObjectStore(storeName: TableName) {
		return this.db.transaction(storeName, 'readwrite').objectStore(storeName)
	}

	async clearAllTables(notClearTable?: TableName): Promise<void> {
		const db = await this.db
		const objectStoreNames = db.objectStoreNames
		console.log({ objectStoreNames })

		// Iterate through each object store and clear it
		for (let i = 0; i < objectStoreNames.length; i++) {
			const objectStoreName = objectStoreNames[i]
			if (objectStoreName !== notClearTable) {
				const store = this.getObjectStore(objectStoreName)
				await store.clear()
			}
		}
	}

	addObserver(callback) {
		this.observer = callback
	}

	removeObserver() {
		this.observer = null
	}

	public async loadStoredTree(): Promise<StoredTree> {
		// return result
		const nctPosition = await this.getValue(NCT_POSITION_TABLE_NAME, 'position')

		const nctForgotten = await this.getValue(
			NCT_FORGOTTEN_TABLE_NAME,
			'forgotten'
		)

		const nctHashes: StoredHash[] = await this.getAllValue(
			NCT_HASHES_TABLE_NAME
		)

		const nctCommitments: StoredCommitment[] = await this.getAllValue(
			NCT_COMMITMENTS_TABLE_NAME
		)

		return {
			commitments: nctCommitments,
			hashes: nctHashes,
			last_forgotten: nctForgotten,
			last_position: nctPosition,
		}
	}
}
