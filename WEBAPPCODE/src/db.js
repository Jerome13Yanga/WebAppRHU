/**
 * Database & Storage Abstraction Layer (Supabase + IndexedDB Engine)
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */
import { SUPABASE_URL, SUPABASE_ANON_KEY, TABLES, STORE_KEYS } from './config.js';

export const isSupabaseConfigured = () =>
  typeof window.supabase !== "undefined" &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PASTE_YOUR") &&
  SUPABASE_ANON_KEY.length > 30 &&
  !SUPABASE_ANON_KEY.includes("PASTE_YOUR");

export const db = isSupabaseConfigured() ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
export const isOnlineMode = () => Boolean(db);

const DB_NAME = 'rhu_health_indexed_db';
const DB_VERSION = 2;
let idbInstance = null;

// Initialize IndexedDB Engine
export async function openIndexedDB() {
  if (idbInstance) return idbInstance;
  return new Promise((resolve) => {
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
      const idb = e.target.result;
      STORE_KEYS.forEach(key => {
        if (!idb.objectStoreNames.contains(key)) {
          idb.createObjectStore(key, { keyPath: 'id', autoIncrement: false });
        }
      });
      if (!idb.objectStoreNames.contains('pendingSyncQueue')) {
        idb.createObjectStore('pendingSyncQueue', { keyPath: 'syncId', autoIncrement: true });
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
  if (!row) return {};
  const copy = { ...row };

  if (key === "users") {
    delete copy.password;
    delete copy.auth_user_id;
  }

  if (key === "infantRecords") {
    if (copy.motherName) {
      if (!copy.parentName) copy.parentName = copy.motherName;
      delete copy.motherName;
    }
    delete copy.mother_name;
  }

  if (key === "checkupSchedules") {
    // Sanitize time into valid Postgres 'time' format (HH:MM:SS)
    if (copy.time) {
      const match = String(copy.time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = match[3] ? match[3].toUpperCase() : null;
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        copy.time = `${String(hours).padStart(2, '0')}:${minutes}:00`;
      } else if (!/^\d{2}:\d{2}(:\d{2})?$/.test(String(copy.time))) {
        copy.time = "08:30:00";
      }
    } else {
      copy.time = "08:30:00";
    }
    // Embed parentName, maternalRecordId, infantRecordId, userId into notes so it's NEVER lost across Supabase
    const metaTags = [];
    if (copy.parentName && !copy.notes?.includes('[Parent:')) metaTags.push(`[Parent: ${copy.parentName}]`);
    if (copy.maternalRecordId && !copy.notes?.includes('[MaternalID:')) metaTags.push(`[MaternalID: ${copy.maternalRecordId}]`);
    if (copy.infantRecordId && !copy.notes?.includes('[InfantID:')) metaTags.push(`[InfantID: ${copy.infantRecordId}]`);
    if ((copy.user_id || copy.userId) && !copy.notes?.includes('[UserID:')) metaTags.push(`[UserID: ${copy.user_id || copy.userId}]`);
    if (metaTags.length > 0) {
      copy.notes = copy.notes ? `${copy.notes} ${metaTags.join(' ')}` : metaTags.join(' ');
    }

    // Delete local-only matching helper fields before Supabase upsert to prevent schema errors
    delete copy.userId;
    delete copy.user_id;
    delete copy.parentName;
    delete copy.maternalRecordId;
    delete copy.infantRecordId;
  }

  // Clean empty string dates/timestamps to null
  const dateFields = [
    "lmp", "edd", "birthdate", "lastCheckup", "nextCheckup", "checkupDate", "nextCheckupDate",
    "date", "scheduleDate", "dateSubmitted", "created_at", "updated_at", "verified_at"
  ];
  dateFields.forEach((field) => {
    if (copy[field] === "") copy[field] = null;
  });

  if (copy.time === "") copy.time = null;
  if (copy.authUserId === "") copy.authUserId = null;
  if (copy.user_id === "") copy.user_id = null;

  return copy;
}
