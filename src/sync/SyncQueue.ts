/**
 * Sync Queue Manager
 *
 * Handles offline-first synchronization with exponential backoff retry logic.
 * Operations are queued when offline and automatically processed when online.
 */

import { generateId } from '@/db/schema';
import { syncQueue } from '@/db/index';
import type {
  SyncProcessor,
  SyncQueueConfig,
  SyncResult,
  SyncStats,
  SyncStatus,
} from './types';

const DEFAULT_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000, // 1 second
  maxDelay: 60000, // 60 seconds
  processDelay: 100, // 100ms between items
} as const;

/**
 * Calculate exponential backoff delay
 * @param retryCount - Current retry attempt
 * @param baseDelay - Base delay in milliseconds
 * @param maxDelay - Maximum delay in milliseconds
 */
function calculateBackoff(
  retryCount: number,
  baseDelay: number,
  maxDelay: number
): number {
  // Exponential backoff: baseDelay * 2^retryCount
  const delay = baseDelay * Math.pow(2, retryCount);
  // Add jitter to avoid thundering herd
  const jitter = delay * 0.1 * Math.random();
  return Math.min(delay + jitter, maxDelay);
}

/**
 * Sync Queue Manager Class
 */
export class SyncQueueManager {
  private config: SyncQueueConfig & typeof DEFAULT_CONFIG;
  private isProcessing: boolean = false;
  private abortController: AbortController | null = null;
  private status: SyncStatus = 'idle';
  private lastSyncTime: string | null = null;
  private listeners: Set<(stats: SyncStats) => void> = new Set();

  constructor(config: SyncQueueConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Subscribe to sync status changes
   */
  subscribe(callback: (stats: SyncStats) => void): () => void {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of status change
   */
  private notify(): void {
    this.getStats().then((stats) => {
      this.listeners.forEach((callback) => callback(stats));
    });
  }

  /**
   * Add an operation to the sync queue
   */
  async add(
    type: SyncOperationType,
    payload: any
  ): Promise<string> {
    const item: SyncQueueItem = {
      id: generateId('sync'),
      type,
      payload,
      userId: this.config.userId,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    await syncQueue.add(item);
    console.log('[SyncQueue] Item added:', item.id, item.type);
    this.notify();

    return item.id;
  }

  /**
   * Remove an item from the sync queue
   */
  async remove(itemId: string): Promise<void> {
    await syncQueue.delete(itemId);
    console.log('[SyncQueue] Item removed:', itemId);
    this.notify();
  }

  /**
   * Get current sync statistics
   */
  async getStats(): Promise<SyncStats> {
    const pendingItems = await syncQueue.getPending(this.config.userId);
    const pending = pendingItems.filter((item) => item.retryCount === 0).length;
    const failed = pendingItems.filter((item) => item.retryCount > 0).length;

    return {
      pending,
      failed,
      lastSyncTime: this.lastSyncTime,
      status: this.status,
    };
  }

  /**
   * Process a single sync queue item with retry logic
   */
  private async processItem(
    item: SyncQueueItem,
    processor: SyncProcessor,
    signal: AbortSignal
  ): Promise<SyncResult> {
    // Check if aborted
    if (signal.aborted) {
      return { success: false, itemId: item.id, error: 'Aborted' };
    }

    // Check if max retries exceeded
    if (item.retryCount >= this.config.maxRetries) {
      console.error('[SyncQueue] Max retries exceeded for item:', item.id);
      return {
        success: false,
        itemId: item.id,
        error: `Max retries (${this.config.maxRetries}) exceeded`,
      };
    }

    try {
      const success = await processor(item);

      if (success) {
        await syncQueue.delete(item.id);
        return { success: true, itemId: item.id };
      } else {
        // Processor returned false - increment retry count
        item.retryCount++;
        await syncQueue.add(item);
        return {
          success: false,
          itemId: item.id,
          error: 'Processor returned false',
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[SyncQueue] Item failed:', item.id, errorMessage);

      // Update retry count and error
      item.retryCount++;
      item.lastError = errorMessage;
      await syncQueue.add(item);

      return { success: false, itemId: item.id, error: errorMessage };
    }
  }

  /**
   * Process all pending sync queue items
   */
  async process(processor: SyncProcessor): Promise<SyncResult[]> {
    if (this.isProcessing) {
      console.log('[SyncQueue] Already processing, skipping');
      return [];
    }

    this.isProcessing = true;
    this.status = 'syncing';
    this.abortController = new AbortController();
    this.notify();

    const results: SyncResult[] = [];
    const { signal } = this.abortController;

    try {
      const items = await syncQueue.getPending(this.config.userId);

      // Sort items: pending items (retryCount=0) first, then by createdAt
      items.sort((a, b) => {
        if (a.retryCount !== b.retryCount) {
          return a.retryCount - b.retryCount;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      for (const item of items) {
        if (signal.aborted) {
          console.log('[SyncQueue] Processing aborted');
          break;
        }

        // Calculate backoff delay for items with retryCount > 0
        if (item.retryCount > 0) {
          const delay = calculateBackoff(
            item.retryCount,
            this.config.baseDelay,
            this.config.maxDelay
          );

          // Check if enough time has passed since last retry
          const lastRetryTime = new Date(item.createdAt).getTime();
          const timeSinceRetry = Date.now() - lastRetryTime;

          if (timeSinceRetry < delay) {
            const waitTime = delay - timeSinceRetry;
            console.log(
              `[SyncQueue] Waiting ${waitTime}ms before retry for item:`,
              item.id
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }

        const result = await this.processItem(item, processor, signal);
        results.push(result);

        // Delay between processing items
        if (this.config.processDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.config.processDelay));
        }
      }

      this.lastSyncTime = new Date().toISOString();
      this.status = results.every((r) => r.success) ? 'success' : 'error';
      console.log('[SyncQueue] Processing complete:', {
        total: results.length,
        success: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      });
    } catch (error) {
      console.error('[SyncQueue] Processing error:', error);
      this.status = 'error';
    } finally {
      this.isProcessing = false;
      this.abortController = null;
      this.notify();
    }

    return results;
  }

  /**
   * Abort ongoing sync processing
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      console.log('[SyncQueue] Processing aborted by user');
    }
  }

  /**
   * Clear all items from the sync queue
   */
  async clear(): Promise<void> {
    await syncQueue.clear(this.config.userId);
    console.log('[SyncQueue] Queue cleared');
    this.notify();
  }

  /**
   * Get current status
   */
  getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * Check if currently processing
   */
  isActive(): boolean {
    return this.isProcessing;
  }

  /**
   * Destroy the sync queue manager
   */
  destroy(): void {
    this.abort();
    this.listeners.clear();
  }
}

/**
 * Create a singleton sync queue instance
 */
let globalSyncQueue: SyncQueueManager | null = null;

export function getSyncQueue(userId: string): SyncQueueManager {
  if (!globalSyncQueue || globalSyncQueue['config']?.userId !== userId) {
    globalSyncQueue = new SyncQueueManager({ userId });
  }
  return globalSyncQueue;
}

export function destroySyncQueue(): void {
  if (globalSyncQueue) {
    globalSyncQueue.destroy();
    globalSyncQueue = null;
  }
}
