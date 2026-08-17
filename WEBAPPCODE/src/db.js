/**
 * Database & Storage Abstraction Layer (Supabase + IndexedDB Engine)
 */
import { SUPABASE_URL, SUPABASE_ANON_KEY, TABLES, STORE_KEYS } from './config.js';
import { toast } from './utils/sanitize.js';

export const isSupabaseConfigured = () =>
  typeof window.supabase !== "undefined" &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PASTE_YOUR") &&
  SUPABASE_ANON_KEY.length > 30 &&
  !SUPABASE_ANON_KEY.includes("PASTE_YOUR");

export const db = isSupabaseConfigured() ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
export const isOnlineMode = () => Boolean(db);

const DB_NAME = 'rhu_health_indexed_db';
const DB_VERSION = 1;
let idbInstance = null;

// Initialize IndexedDB Engine
export async function openIndexedDB() {
  if (idbInstance) return idbInstance;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (e) => {
      console.error('IndexedDB Error:', e);
      resolve(null);
    };
    request.onsuccess = (e) => {
      idbInstance = e.target.result;
      resolve(idbInstance);
    };
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      STORE_KEYS.forEach(key => {
        if (!db.objectStoreNames.contains(key)) {
          db.createObjectStore(key, { keyPath: 'id', autoIncrement: false });
        }
      });
      if (!db.objectStoreNames.contains('pendingSyncQueue')) {
        db.createObjectStore('pendingSyncQueue', { keyPath: 'syncId', autoIncrement: true });
      }
    };
  });
}

// Local storage fallback helper
export function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(`rhu_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveLocal(key, value) {
  try {
    localStorage.setItem(`rhu_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn(`localStorage quota exceeded for ${key}`, e);
  }
}

// Read collection from IndexedDB or LocalStorage
export async function loadCollection(key, fallback = []) {
  const idb = await openIndexedDB();
  if (idb && idb.objectStoreNames.contains(key)) {
    return new Promise((resolve) => {
      const transaction = idb.transaction([key], 'readonly');
      const store = transaction.objectStore(key);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || fallback);
      request.onerror = () => resolve(readLocal(key, fallback));
    });
  }
  return readLocal(key, fallback);
}

// Save collection to IndexedDB and LocalStorage fallback
export async function saveCollection(key, dataArray) {
  saveLocal(key, dataArray);
  const idb = await openIndexedDB();
  if (idb && idb.objectStoreNames.contains(key)) {
    const transaction = idb.transaction([key], 'readwrite');
    const store = transaction.objectStore(key);
    store.clear();
    if (Array.isArray(dataArray)) {
      dataArray.forEach(item => {
        if (item && item.id) store.put(item);
      });
    }
  }
}

// Data row cleaner for Supabase
export function cleanRemoteRow(key, row) {
  const copy = { ...row };
  if (key === "users") delete copy.password;
  ["lmp", "edd", "birthdate", "lastCheckup", "nextCheckup", "date", "scheduleDate", "dateSubmitted"].forEach((field) => {
    if (copy[field] === "") copy[field] = null;
  });
  if (copy.time === "") copy.time = null;
  if (copy.authUserId === "") copy.authUserId = null;
  return copy;
}
