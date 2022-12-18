import { IDBPDatabase, openDB } from 'idb';

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
  | 'tx_by_nullifier';

export class IndexedDb {
  private database: string;
  private db: any;

  constructor() {
    this.database = 'penumbra';
    this.createObjectStore();
  }

  public async createObjectStore() {
    try {
      this.db = await openDB(this.database, 2, {
        upgrade(db: IDBPDatabase) {
          db.createObjectStore('assets', {
            autoIncrement: true,
            keyPath: 'decodeId',
          });

          db.createObjectStore('chainParameters', {
            autoIncrement: true,
            keyPath: 'chainId',
          });
          db.createObjectStore('notes', {
            autoIncrement: true,
            keyPath: 'note_commitment',
          });

          db.createObjectStore('tx', {
            keyPath: 'tx_hash',
          });

          db.createObjectStore('fmd_parameters', {
            keyPath: 'precisionBits',
          });

          db.createObjectStore('nct_commitments', {
            keyPath: 'position',
          });

          db.createObjectStore('nct_forgotten', {
            keyPath: 'forgotten',
          });

          db.createObjectStore('nct_hashes', {
            keyPath: 'position',
          });
          db.createObjectStore('nct_position', {
            keyPath: 'position',
          });

          db.createObjectStore('spendable_notes', {
            autoIncrement: true,
            keyPath: 'note_commitment',
          });

          db.createObjectStore('tx_by_nullifier', {
            autoIncrement: true,
            keyPath: 'nullifier',
          });
        },
      });
    } catch (error) {
      return false;
    }
  }

  public async getValue(tableName: TableName, id: number) {
    const tx = this.db.transaction(tableName, 'readonly');
    const store = tx.objectStore(tableName);
    const result = await store.get(id);
    return result;
  }

  public async getAllValue(tableName: TableName) {
    const tx = this.db.transaction(tableName, 'readonly');
    const store = tx.objectStore(tableName);
    const result = await store.getAll();

    return result;
  }

  public async putValue(tableName: TableName, value: object) {
    const tx = this.db.transaction(tableName, 'readwrite');
    const store = tx.objectStore(tableName);
    const result = await store.put(value);
    return result;
  }

  public async putBulkValue(tableName: TableName, values: object[]) {
    const tx = this.db.transaction(tableName, 'readwrite');
    const store = tx.objectStore(tableName);
    for (const value of values) {
      await store.put(value);
    }
    return this.getAllValue(tableName);
  }

  public async deleteValue(tableName: TableName, id: number) {
    const tx = this.db.transaction(tableName, 'readwrite');
    const store = tx.objectStore(tableName);
    const result = await store.get(id);
    if (!result) {
      console.log('Id not found', id);
      return result;
    }
    await store.delete(id);
    console.log('Deleted Data', id);
    return id;
  }

  public async resetTables(tableName: string[]) {
    const tx = this.db.transaction([tableName], 'readwrite');
    const store = tx.objectStore(tableName);
    await store.clear();
  }
}
