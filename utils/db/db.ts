// Modern IndexedDB wrapper with schema versioning and migrations (2025 best practices)

export interface StoreConfig {
  name: string;
  keyPath: string;
  autoIncrement?: boolean;
  indexes?: Array<{
    name: string;
    keyPath: string | string[];
    unique?: boolean;
    multiEntry?: boolean;
  }>;
}

export interface Schema {
  version: number;
  stores: StoreConfig[];
}

export class Database {
  private db: IDBDatabase | null = null;
  private readonly dbName: string;
  private readonly schemas: Schema[];

  constructor(dbName: string, schemas: Schema[]) {
    this.dbName = dbName;
    this.schemas = schemas.sort((a, b) => a.version - b.version);
  }

  async init(): Promise<void> {
    if (this.db) return; // Already initialized

    const latestVersion = this.schemas[this.schemas.length - 1]?.version || 1;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, latestVersion);

      request.onerror = () => reject(new Error(`Failed to open database: ${request.error?.message}`));
      
      request.onsuccess = () => {
        this.db = request.result;
        this.db.onerror = (event) => {
          console.error('Database error:', (event.target as IDBRequest).error);
        };
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;

        // Apply migrations from oldVersion to current
        this.schemas
          .filter(schema => schema.version > oldVersion)
          .forEach(schema => {
            this.applySchema(db, schema);
          });
      };
    });
  }

  private applySchema(db: IDBDatabase, schema: Schema): void {
    schema.stores.forEach(storeConfig => {
      // Create store if it doesn't exist
      if (!db.objectStoreNames.contains(storeConfig.name)) {
        const store = db.createObjectStore(storeConfig.name, {
          keyPath: storeConfig.keyPath,
          autoIncrement: storeConfig.autoIncrement || false,
        });

        // Create indexes
        storeConfig.indexes?.forEach(indexConfig => {
          store.createIndex(indexConfig.name, indexConfig.keyPath, {
            unique: indexConfig.unique || false,
            multiEntry: indexConfig.multiEntry || false,
          });
        });
      }
    });
  }

  getStore(storeName: string, mode: IDBTransactionMode = "readonly"): IDBObjectStore {
    if (!this.db) throw new Error("Database not initialized. Call init() first.");
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  get isInitialized(): boolean {
    return this.db !== null;
  }
}

// Helper to wrap IndexedDB operations in promises
export class DBOperations {
  constructor(private readonly db: Database) {}

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    if (!this.db.isInitialized) await this.db.init();
    
    return new Promise((resolve, reject) => {
      const store = this.db.getStore(storeName, "readonly");
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string, query?: IDBValidKey | IDBKeyRange): Promise<T[]> {
    if (!this.db.isInitialized) await this.db.init();
    
    return new Promise((resolve, reject) => {
      const store = this.db.getStore(storeName, "readonly");
      const request = store.getAll(query);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, value: T): Promise<IDBValidKey> {
    if (!this.db.isInitialized) await this.db.init();
    
    return new Promise((resolve, reject) => {
      const store = this.db.getStore(storeName, "readwrite");
      const request = store.put(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add<T>(storeName: string, value: T): Promise<IDBValidKey> {
    if (!this.db.isInitialized) await this.db.init();
    
    return new Promise((resolve, reject) => {
      const store = this.db.getStore(storeName, "readwrite");
      const request = store.add(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    if (!this.db.isInitialized) await this.db.init();
    
    return new Promise((resolve, reject) => {
      const store = this.db.getStore(storeName, "readwrite");
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db.isInitialized) await this.db.init();
    
    return new Promise((resolve, reject) => {
      const store = this.db.getStore(storeName, "readwrite");
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async count(storeName: string, query?: IDBValidKey | IDBKeyRange): Promise<number> {
    if (!this.db.isInitialized) await this.db.init();
    
    return new Promise((resolve, reject) => {
      const store = this.db.getStore(storeName, "readonly");
      const request = store.count(query);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(
    storeName: string,
    indexName: string,
    key: IDBValidKey
  ): Promise<T | undefined> {
    if (!this.db.isInitialized) await this.db.init();
    
    return new Promise((resolve, reject) => {
      const store = this.db.getStore(storeName, "readonly");
      const index = store.index(indexName);
      const request = index.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllByIndex<T>(
    storeName: string,
    indexName: string,
    query?: IDBValidKey | IDBKeyRange
  ): Promise<T[]> {
    if (!this.db.isInitialized) await this.db.init();
    
    return new Promise((resolve, reject) => {
      const store = this.db.getStore(storeName, "readonly");
      const index = store.index(indexName);
      const request = index.getAll(query);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
