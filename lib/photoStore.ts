// IndexedDB storage for photo-based wallpaper masters. These are raster
// composites of the user's own photos — they never leave the device, so
// they can't live behind the server wallpaper URL like vector dials do.

const DB_NAME = 'watchpaper';
const STORE = 'photos';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        let result: T;
        req.onsuccess = () => {
          result = req.result;
        };
        // resolve only on COMMIT — a quota-exceeded write can fire the request's
        // success event and still abort the transaction at commit time
        t.oncomplete = () => {
          db.close();
          resolve(result);
        };
        t.onabort = () => {
          db.close();
          reject(t.error ?? req.error ?? new Error('Storage transaction aborted.'));
        };
      }),
  );
}

export function putPhoto(id: string, blob: Blob): Promise<IDBValidKey> {
  return tx('readwrite', (s) => s.put(blob, id));
}

export function getPhoto(id: string): Promise<Blob | null> {
  return tx<Blob | undefined>('readonly', (s) => s.get(id)).then((b) => b ?? null);
}

export function deletePhoto(id: string): Promise<void> {
  return tx('readwrite', (s) => s.delete(id)).then(() => undefined);
}
