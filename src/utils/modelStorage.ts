/**
 * Client-side IndexedDB storage for custom 3D models (.glb, .gltf, .fbx).
 * Allows user-uploaded models to persist permanently across page reloads and browser sessions.
 */

const DB_NAME = 'morning20_3d_models_db';
const STORE_NAME = 'models_store';
const MODEL_KEY = 'active_custom_model';

export interface StoredModelRecord {
  fileName: string;
  fileType: 'glb' | 'fbx';
  buffer: ArrayBuffer;
  savedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomModelToDB(
  fileName: string,
  buffer: ArrayBuffer
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const fileType = fileName.toLowerCase().endsWith('.fbx') ? 'fbx' : 'glb';
    const record: StoredModelRecord = {
      fileName,
      fileType,
      buffer,
      savedAt: Date.now(),
    };
    const req = store.put(record, MODEL_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadCustomModelFromDB(): Promise<StoredModelRecord | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(MODEL_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function clearCustomModelFromDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(MODEL_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}
