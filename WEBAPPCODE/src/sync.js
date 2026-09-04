/**
 * Offline Sync Engine & Queue Manager
 */
import { db, isOnlineMode, openIndexedDB, cleanRemoteRow } from './db.js';
import { TABLES } from './config.js';
import { toast } from './utils/sanitize.js';

let isSyncing = false;

// Queue an action for background synchronization when offline
export async function queueOfflineAction(collectionKey, actionType, payload) {
  const idb = await openIndexedDB();
  if (!idb) return;
  const transaction = idb.transaction(['pendingSyncQueue'], 'readwrite');
  const store = transaction.objectStore('pendingSyncQueue');
  store.add({
    collectionKey,
    actionType, // 'UPSERT' or 'DELETE'
    payload,
    timestamp: new Date().toISOString()
  });
  toast('Saved offline. Will sync automatically when connected.', false);
}

// Flush pending queue to Supabase
export async function flushPendingSyncQueue() {
  if (!isOnlineMode() || isSyncing) return;
  const idb = await openIndexedDB();
  if (!idb) return;

  isSyncing = true;
  try {
    const transaction = idb.transaction(['pendingSyncQueue'], 'readwrite');
    const store = transaction.objectStore('pendingSyncQueue');
    const request = store.getAll();

    request.onsuccess = async () => {
      const queue = request.result || [];
      if (!queue.length) {
        isSyncing = false;
        return;
      }

      let successCount = 0;
      for (const item of queue) {
        const { collectionKey, actionType, payload, syncId } = item;
        const tableName = TABLES[collectionKey];
        if (!tableName) continue;

        if (actionType === 'UPSERT') {
          const { error } = await db.from(tableName).upsert(cleanRemoteRow(collectionKey, payload), { onConflict: 'id' });
          if (!error) {
            deleteQueueItem(syncId);
            successCount++;
          } else if (error.code === 'PGRST204' || error.status === 400 || (error.message && error.message.includes('schema cache'))) {
            console.warn(`Removing invalid schema payload from sync queue for ${collectionKey}:`, error.message);
            deleteQueueItem(syncId);
          }
        } else if (actionType === 'DELETE') {
          const { error } = await db.from(tableName).delete().eq('id', payload.id);
          if (!error || error.status === 400) {
            deleteQueueItem(syncId);
            if (!error) successCount++;
          }
        }
      }

      if (successCount > 0) {
        toast(`Synced ${successCount} offline change(s) to Supabase.`, false);
      }
      isSyncing = false;
    };
  } catch (e) {
    console.error('Flush sync queue error:', e);
    isSyncing = false;
  }
}

async function deleteQueueItem(syncId) {
  const idb = await openIndexedDB();
  if (!idb) return;
  const transaction = idb.transaction(['pendingSyncQueue'], 'readwrite');
  const store = transaction.objectStore('pendingSyncQueue');
  store.delete(syncId);
}

// Network status listener initialization
export function initSyncEngine() {
  window.addEventListener('online', () => {
    toast('Network connection restored. Syncing...', false);
    flushPendingSyncQueue();
  });
  window.addEventListener('offline', () => {
    toast('Network offline. Changes will be saved locally.', true);
  });
}
