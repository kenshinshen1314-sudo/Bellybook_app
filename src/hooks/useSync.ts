/**
 * useSync Hook
 *
 * React hook for managing sync queue operations
 */

import { useCallback, useEffect, useState } from 'react';
import { getSyncQueue, type SyncQueueManager } from '@/sync/SyncQueue';
import { syncProcessor, pullRemoteChanges } from '@/api/syncProcessor';
import type { SyncStats, SyncStatus } from '@/sync/types';

export interface UseSyncOptions {
  /** User ID for sync operations */
  userId: string;
  /** Whether to auto-sync when coming online */
  autoSync?: boolean;
}

export interface UseSyncReturn {
  /** Current sync statistics */
  stats: SyncStats;
  /** Add an operation to the sync queue */
  addSync: (type: SyncOperationType, payload: any) => Promise<string>;
  /** Process the sync queue manually */
  processSync: () => Promise<void>;
  /** Abort ongoing sync */
  abortSync: () => void;
  /** Clear all sync items */
  clearSync: () => Promise<void>;
  /** Current sync status */
  status: SyncStatus;
  /** Whether sync is currently processing */
  isSyncing: boolean;
}

/**
 * Hook for managing sync queue
 */
export function useSync(options: UseSyncOptions): UseSyncReturn {
  const { userId, autoSync = true } = options;

  const [stats, setStats] = useState<SyncStats>({
    pending: 0,
    failed: 0,
    lastSyncTime: null,
    status: 'idle',
  });

  const [syncQueue, setSyncQueue] = useState<SyncQueueManager | null>(() => {
    return userId ? getSyncQueue(userId) : null;
  });

  // Update sync queue when userId changes
  useEffect(() => {
    if (userId) {
      const queue = getSyncQueue(userId);
      setSyncQueue(queue);

      // Subscribe to stats changes
      const unsubscribe = queue.subscribe((newStats) => {
        setStats(newStats);
      });

      // Get initial stats
      queue.getStats().then(setStats);

      return () => {
        unsubscribe();
      };
    }
  }, [userId]);

  // Auto-sync when coming online (if enabled)
  useEffect(() => {
    if (!autoSync || !syncQueue) return;

    const handleOnline = async () => {
      console.log('[useSync] Online detected, triggering sync...');
      try {
        // First, pull remote changes
        await pullRemoteChanges(stats.lastSyncTime || undefined);

        // Then, push local changes
        await syncQueue.process(syncProcessor);
      } catch (error) {
        console.error('[useSync] Auto-sync error:', error);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [autoSync, syncQueue, stats.lastSyncTime]);

  const addSync = useCallback(
    async (type: SyncOperationType, payload: any): Promise<string> => {
      if (!syncQueue) {
        throw new Error('[useSync] Sync queue not initialized');
      }
      return syncQueue.add(type, payload);
    },
    [syncQueue]
  );

  const processSync = useCallback(async (): Promise<void> => {
    if (!syncQueue) {
      throw new Error('[useSync] Sync queue not initialized');
    }
    // First, pull remote changes
    await pullRemoteChanges(stats.lastSyncTime || undefined);

    // Then, push local changes using sync processor
    await syncQueue.process(syncProcessor);
  }, [syncQueue, stats.lastSyncTime]);

  const abortSync = useCallback(() => {
    syncQueue?.abort();
  }, [syncQueue]);

  const clearSync = useCallback(async () => {
    if (!syncQueue) {
      throw new Error('[useSync] Sync queue not initialized');
    }
    await syncQueue.clear();
  }, [syncQueue]);

  return {
    stats,
    addSync,
    processSync,
    abortSync,
    clearSync,
    status: stats.status,
    isSyncing: stats.status === 'syncing',
  };
}
