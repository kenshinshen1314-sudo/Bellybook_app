/**
 * Sync Queue Types and Interfaces
 */

import type { SyncOperationType, SyncQueueItem } from '@/db/schema';

/**
 * Sync operation status
 */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

/**
 * Sync queue statistics
 */
export interface SyncStats {
  pending: number;
  failed: number;
  lastSyncTime: string | null;
  status: SyncStatus;
}

/**
 * Sync operation result
 */
export interface SyncResult {
  success: boolean;
  itemId: string;
  error?: string;
}

/**
 * Configuration for sync queue processing
 */
export interface SyncQueueConfig {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Base delay for exponential backoff (ms) */
  baseDelay?: number;
  /** Maximum delay for exponential backoff (ms) */
  maxDelay?: number;
  /** Delay between processing items (ms) */
  processDelay?: number;
  /** User ID for queue operations */
  userId: string;
}

/**
 * Sync operation processor function
 * Returns true if operation succeeded, false if should retry
 */
export type SyncProcessor = (item: SyncQueueItem) => Promise<boolean>;

/**
 * Payload types for each sync operation
 */
export interface CreateMealPayload {
  mealId: string;
  data: {
    userId: string;
    imageUrl: string;
    analysis: any;
    mealType?: string;
    notes?: string;
  };
}

export interface UpdateMealPayload {
  mealId: string;
  data: Partial<{
    mealType: string;
    notes: string;
  }>;
}

export interface DeleteMealPayload {
  mealId: string;
}

export interface UpdateProfilePayload {
  data: Partial<{
    displayName: string;
    bio: string;
    avatarUrl: string;
  }>;
}

export interface UpdateSettingsPayload {
  data: Partial<{
    language: string;
    theme: string;
    notificationsEnabled: boolean;
    reminderTime: string;
  }>;
}

export type SyncPayload =
  | CreateMealPayload
  | UpdateMealPayload
  | DeleteMealPayload
  | UpdateProfilePayload
  | UpdateSettingsPayload;
