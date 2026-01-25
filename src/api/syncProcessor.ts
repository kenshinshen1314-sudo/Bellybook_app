/**
 * Sync Queue Processor
 *
 * Processes sync queue items by making API calls
 * Integrates with the SyncQueueManager to handle offline/online synchronization
 */

import type { SyncQueueItem } from '@/db/schema';
import type { SyncProcessor } from '@/sync/types';
import { meals } from './meals';
import { profile } from './profile';
import type { SyncPushItem } from './types';
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('SyncProcessor');

/**
 * Convert sync queue item to API push item format
 */
function toPushItem(item: SyncQueueItem): SyncPushItem {
  return {
    type: item.type,
    payload: item.payload,
    clientId: item.id,
  };
}

/**
 * Process a single sync queue item
 * Returns true if successful, false if should retry
 */
export const syncProcessor: SyncProcessor = async (item: SyncQueueItem): Promise<boolean> => {
  try {
    logger.debug('Processing item:', item.type, item.id);

    switch (item.type) {
      case 'CREATE_MEAL': {
        const { mealId, data } = item.payload;
        // Check if meal already exists on server (by syncedAt field)
        // For now, create new meal
        await meals.create({
          imageUrl: data.imageUrl,
          analysis: data.analysis,
          mealType: data.mealType,
          notes: data.notes,
        });
        // After successful creation, update local meal's isSynced flag
        // This is handled by the caller (sync queue manager)
        return true;
      }

      case 'UPDATE_MEAL': {
        const { mealId, data } = item.payload;
        await meals.update(mealId, data);
        return true;
      }

      case 'DELETE_MEAL': {
        const { mealId } = item.payload;
        await meals.delete(mealId);
        return true;
      }

      case 'UPDATE_PROFILE': {
        const { data } = item.payload;
        await profile.update(data);
        return true;
      }

      case 'UPDATE_SETTINGS': {
        const { data } = item.payload;
        await profile.updateSettings(data);
        return true;
      }

      default:
        logger.warn('Unknown sync type:', item.type);
        return false;
    }
  } catch (error) {
    logger.error('Error processing item:', item.id, error);

    // Check if error is permanent (shouldn't retry) or temporary (should retry)
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Permanent errors - don't retry
      if (
        errorMessage.includes('not found') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('forbidden')
      ) {
        logger.debug('Permanent error, not retrying');
        return true; // Return true to remove from queue even though it failed
      }
    }

    // Temporary error - will retry
    return false;
  }
};

/**
 * Batch processor for multiple sync items
 * Uses the sync.push endpoint for efficient batch processing
 */
export async function batchSyncProcessor(items: SyncQueueItem[]): Promise<{
  success: string[];
  failed: Array<{ clientId: string; error: string }>;
}> {
  if (items.length === 0) {
    return { success: [], failed: [] };
  }

  try {
    const pushItems = items.map(toPushItem);

    // Import sync dynamically to avoid circular dependency
    const { sync } = await import('./sync');
    const response = await sync.push(pushItems);

    return {
      success: response.data.success,
      failed: response.data.failed,
    };
  } catch (error) {
    logger.error('Batch sync error:', error);
    // Fall back to individual processing
    return {
      success: [],
      failed: items.map((item) => ({
        clientId: item.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })),
    };
  }
}

/**
 * Pull remote changes from server with conflict detection
 */
export async function pullRemoteChanges(lastSyncAt?: string): Promise<void> {
  try {
    const { sync } = await import('./sync');
    const { getConflictResolver } = await import('@/conflict');
    const { meals: mealsDb } = await import('@/db');

    const response = await sync.pull({
      lastSyncAt,
      includeMeals: true,
      includeProfile: true,
    });

    const { meals: remoteMeals, profile, settings, serverTime } = response.data;

    // Get conflict resolver
    const resolver = getConflictResolver({
      defaultStrategy: 'LAST_WRITE_WINS',
      autoResolve: false,
      notifyUser: true,
    });

    // Process remote meals with conflict detection
    for (const remoteMeal of remoteMeals) {
      const localMeal = await mealsDb.get(remoteMeal.id);

      if (!localMeal) {
        // New meal from server - add to local DB
        await mealsDb.add({
          ...remoteMeal,
          isSynced: true,
          syncedAt: remoteMeal.syncedAt || remoteMeal.updatedAt,
        } as any);
      } else if (!localMeal.isSynced) {
        // Potential conflict: local has unsynced changes
        const detection = resolver.detectConflict(
          'meal',
          remoteMeal.id,
          localMeal,
          remoteMeal
        );

        if (detection.hasConflict && detection.conflict) {
          logger.debug('Conflict detected for meal:', remoteMeal.id);

          // Auto-resolve using Last Write Wins strategy
          const resolution = resolver.resolveLastWriteWins(detection.conflict.id);
          const resolvedData = resolver.getResolvedData(detection.conflict, resolution);

          // Update local DB with resolved data
          await mealsDb.update({
            ...resolvedData,
            isSynced: true,
            syncedAt: new Date().toISOString(),
          } as any);

          logger.debug('Conflict resolved:', resolution.keepVersion);
        } else {
          // No conflict or auto-resolved, update with server data
          await mealsDb.update({
            ...remoteMeal,
            isSynced: true,
            syncedAt: remoteMeal.syncedAt || remoteMeal.updatedAt,
          } as any);
        }
      }
    }

    // Process profile updates with conflict detection
    if (profile || settings) {
      // Similar conflict detection for profile/settings
      // This would be implemented with the actual profile data
    }

    logger.debug('Pull complete:', {
      mealsProcessed: remoteMeals.length,
      conflicts: resolver.getStats(),
      serverTime,
    });
  } catch (error) {
    logger.error('Pull error:', error);
    throw error;
  }
}
