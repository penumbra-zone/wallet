import { IDBPDatabase, openDB } from 'idb'
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb'

export type TableName =
	| 'assets'
	| 'chainParameters'
	| 'notes'
	| 'tx'
	| 'fmd_parameters'
	| 'nct_commitments'
	| 'nct_forgotten'
	| 'nct_hashes'
	| 'nct_position'
	| 'spendable_notes'
	| 'tx_by_nullifier'
	| 'swaps'

export class IndexedDb {
	private database: string
	private db: any

	constructor() {
		this.database = 'penumbra'
		this.createObjectStore()
	}

	public async createObjectStore() {
		try {
			this.db = await openDB(this.database, 2, {
				upgrade(db: IDBPDatabase) {
					db.createObjectStore('assets', {
						autoIncrement: true,
						keyPath: 'decodeId',
					})

					db.createObjectStore('chainParameters', {
						autoIncrement: true,
						keyPath: 'chainId',
					})
					db.createObjectStore('notes', {
						autoIncrement: true,
						keyPath: 'noteCommitmentHex',
					})

					db.createObjectStore('tx', {
						keyPath: 'txHashHex',
					})

					db.createObjectStore('fmd_parameters')

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

					db.createObjectStore('spendable_notes')

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

	public async updateNotes(nullifier: Nullifier, height: bigint) {
		const tx = this.db.transaction('spendable_notes', 'readwrite')
		const store = tx.objectStore('spendable_notes')
		const result = await store.getAll()

		for (const note of result) {
			if (JSON.stringify(note.nullifier) == JSON.stringify(nullifier)) {
				note.heightSpent = height
				await store.put(note, note.noteCommitment.inner)
			}
		}
	}

	public async getBalances() {
		const tx = this.db.transaction('spendable_notes', 'readwrite')
		const store = tx.objectStore('spendable_notes')
		const result = await store.getAll()

		const balances = result
			.filter(note => note.heightSpent === undefined)
			.map(note => ({
				assetId: note.note.value.assetId.inner,
				amount: note.note.value.amount.lo,
			}))
		return balances
	}

	public async getBalance(tableName: TableName) {
		const tx = this.db.transaction(tableName, 'readonly')
		const store = tx.objectStore(tableName)

		const result = await store.getAll()

		const balances = result.map(i => ({
			heightCreated: Number(i.heightCreated),
			amount: Number(i.note.value.amount.lo),
		}))

		return balances
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
		return result
	}

	public async putValueWithId(tableName: TableName, value: object, id) {
		const tx = this.db.transaction(tableName, 'readwrite')
		const store = tx.objectStore(tableName)
		const result = await store.put(value, id)
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
}
