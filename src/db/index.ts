/**
 * IndexedDB Wrapper for Bellybook App
 * Provides a clean API for IndexedDB operations using the 'idb' library
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import {
  DB_CONFIG,
  DB_STORES,
  createObjectStores,
  handleMigration,
  type UserProfile,
  type UserSettings,
  type Meal,
  type SyncQueueItem,
  type DailyNutrition,
  type CuisineUnlock,
} from './schema';

// ============================================================================
// Database Interface Definition
// ============================================================================

interface BellybookDB extends DBSchema {
  [DB_STORES.USERS]: {
    key: string;
    value: {
      profile: UserProfile;
      settings: UserSettings;
    };
    indexes: {
      'createdAt': string;
      'username': string;
    };
  };
  [DB_STORES.MEALS]: {
    key: string;
    value: Meal;
    indexes: {
      'userId': string;
      'createdAt': string;
      'date': string;
      'synced': boolean;
      'userId_date': [string, string];
    };
  };
  [DB_STORES.SYNC_QUEUE]: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'createdAt': string;
      'type': string;
      'userId': string;
    };
  };
  [DB_STORES.DAILY_NUTRITION]: {
    key: number;
    value: DailyNutrition;
    indexes: {
      'date': string;
      'userId': string;
      'userId_date': [string, string];
    };
    autoIncrement: true;
  };
  [DB_STORES.CUISINE_UNLOCKS]: {
    key: number;
    value: CuisineUnlock;
    indexes: {
      'userId': string;
      'cuisine': string;
    };
    autoIncrement: true;
  };
}

// ============================================================================
// Database Connection
// ============================================================================

let dbInstance: IDBPDatabase<BellybookDB> | null = null;

/**
 * Open database connection
 */
async function openDBConnection(): Promise<IDBPDatabase<BellybookDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  console.log('[DB] Opening database:', DB_CONFIG.name, 'v' + DB_CONFIG.version);

  dbInstance = await openDB<BellybookDB>(DB_CONFIG.name, DB_CONFIG.version, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`[DB] Upgrade: v${oldVersion} → v${newVersion}`);
      createObjectStores(db);
      if (newVersion && oldVersion < newVersion) {
        handleMigration(db, oldVersion, newVersion);
      }
    },
    blocking() {
      console.log('[DB] Database is blocked - another tab is using it');
    },
    blocked() {
      console.log('[DB] Database is blocked - waiting for other tab to close');
    },
  });

  console.log('[DB] Database opened successfully');
  return dbInstance;
}

/**
 * Close database connection
 */
export async function closeDB(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    console.log('[DB] Database closed');
  }
}

/**
 * Get database instance (opens if not already open)
 */
export async function getDB(): Promise<IDBPDatabase<BellybookDB>> {
  return openDBConnection();
}

// ============================================================================
// Users Store Operations
// ============================================================================

export const users = {
  /**
   * Get user data (profile + settings) by ID
   */
  async get(userId: string): Promise<{ profile: UserProfile; settings: UserSettings } | undefined> {
    const db = await getDB();
    return db.get(DB_STORES.USERS, userId);
  },

  /**
   * Save or update user data
   */
  async set(userId: string, data: { profile: UserProfile; settings: UserSettings }): Promise<void> {
    const db = await getDB();
    await db.put(DB_STORES.USERS, data, userId);
    console.log('[DB] User data saved:', userId);
  },

  /**
   * Delete user data
   */
  async delete(userId: string): Promise<void> {
    const db = await getDB();
    await db.delete(DB_STORES.USERS, userId);
    console.log('[DB] User data deleted:', userId);
  },

  /**
   * Get all users
   */
  async getAll(): Promise<Array<{ profile: UserProfile; settings: UserSettings }>> {
    const db = await getDB();
    return db.getAll(DB_STORES.USERS);
  },
};

// ============================================================================
// Meals Store Operations
// ============================================================================

export const meals = {
  /**
   * Get meal by ID
   */
  async get(mealId: string): Promise<Meal | undefined> {
    const db = await getDB();
    return db.get(DB_STORES.MEALS, mealId);
  },

  /**
   * Get all meals for a user
   */
  async getAll(userId: string): Promise<Meal[]> {
    const db = await getDB();
    return db.getAllFromIndex(DB_STORES.MEALS, 'userId', userId);
  },

  /**
   * Get meals by date range
   */
  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<Meal[]> {
    const db = await getDB();
    const index = db.transaction(DB_STORES.MEALS).store.index('userId_date');

    const results: Meal[] = [];
    let cursor = await index.openCursor(IDBKeyRange.bound([userId, startDate], [userId, endDate]));

    while (cursor) {
      results.push(cursor.value);
      cursor = await cursor.continue();
    }

    return results;
  },

  /**
   * Add new meal
   */
  async add(meal: Meal): Promise<string> {
    const db = await getDB();
    const key = await db.add(DB_STORES.MEALS, meal);
    console.log('[DB] Meal added:', key);
    return key;
  },

  /**
   * Update existing meal
   */
  async update(meal: Meal): Promise<void> {
    const db = await getDB();
    await db.put(DB_STORES.MEALS, meal);
    console.log('[DB] Meal updated:', meal.id);
  },

  /**
   * Delete meal
   */
  async delete(mealId: string): Promise<void> {
    const db = await getDB();
    await db.delete(DB_STORES.MEALS, mealId);
    console.log('[DB] Meal deleted:', mealId);
  },

  /**
   * Get unsynced meals
   */
  async getUnsynced(userId: string): Promise<Meal[]> {
    const db = await getDB();
    const tx = db.transaction(DB_STORES.MEALS);
    const index = tx.store.index('userId');
    const unsyncedIndex = tx.store.index('synced');

    const results: Meal[] = [];
    let cursor = await index.openCursor(IDBKeyRange.only(userId));

    while (cursor) {
      if (!cursor.value.isSynced) {
        results.push(cursor.value);
      }
      cursor = await cursor.continue();
    }

    return results;
  },

  /**
   * Mark meal as synced
   */
  async markSynced(mealId: string): Promise<void> {
    const db = await getDB();
    const meal = await db.get(DB_STORES.MEALS, mealId);
    if (meal) {
      meal.isSynced = true;
      meal.syncedAt = new Date().toISOString();
      await db.put(DB_STORES.MEALS, meal);
      console.log('[DB] Meal marked as synced:', mealId);
    }
  },
};

// ============================================================================
// Sync Queue Store Operations
// ============================================================================

export const syncQueue = {
  /**
   * Add item to sync queue
   */
  async add(item: SyncQueueItem): Promise<string> {
    const db = await getDB();
    const key = await db.add(DB_STORES.SYNC_QUEUE, item);
    console.log('[DB] Sync queue item added:', key);
    return key;
  },

  /**
   * Get item by ID
   */
  async get(itemId: string): Promise<SyncQueueItem | undefined> {
    const db = await getDB();
    return db.get(DB_STORES.SYNC_QUEUE, itemId);
  },

  /**
   * Get all pending sync items for a user
   */
  async getPending(userId: string): Promise<SyncQueueItem[]> {
    const db = await getDB();
    return db.getAllFromIndex(DB_STORES.SYNC_QUEUE, 'userId', userId);
  },

  /**
   * Delete item from sync queue
   */
  async delete(itemId: string): Promise<void> {
    const db = await getDB();
    await db.delete(DB_STORES.SYNC_QUEUE, itemId);
    console.log('[DB] Sync queue item deleted:', itemId);
  },

  /**
   * Clear all sync queue items for a user
   */
  async clear(userId: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(DB_STORES.SYNC_QUEUE, 'readwrite');
    const index = tx.store.index('userId');
    let cursor = await index.openCursor(IDBKeyRange.only(userId));

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
    console.log('[DB] Sync queue cleared for user:', userId);
  },

  /**
   * Process sync queue with retry logic
   */
  async process(
    userId: string,
    processor: (item: SyncQueueItem) => Promise<boolean>
  ): Promise<{ success: number; failed: number }> {
    const items = await syncQueue.getPending(userId);
    let success = 0;
    let failed = 0;

    for (const item of items) {
      try {
        const result = await processor(item);
        if (result) {
          await syncQueue.delete(item.id);
          success++;
        } else {
          // Update retry count
          item.retryCount++;
          const db = await getDB();
          await db.put(DB_STORES.SYNC_QUEUE, item);
          failed++;
        }
      } catch (error) {
        console.error('[DB] Sync queue item failed:', item.id, error);
        item.retryCount++;
        item.lastError = error instanceof Error ? error.message : 'Unknown error';
        const db = await getDB();
        await db.put(DB_STORES.SYNC_QUEUE, item);
        failed++;
      }
    }

    console.log('[DB] Sync queue processed:', { success, failed });
    return { success, failed };
  },
};

// ============================================================================
// Daily Nutrition Store Operations
// ============================================================================

export const dailyNutrition = {
  /**
   * Get daily nutrition by user and date
   */
  async get(userId: string, date: string): Promise<DailyNutrition | undefined> {
    const db = await getDB();
    const index = db.transaction(DB_STORES.DAILY_NUTRITION).store.index('userId_date');
    const result = await index.get(IDBKeyRange.only([userId, date]));
    return result;
  },

  /**
   * Save or update daily nutrition
   */
  async set(data: DailyNutrition): Promise<number> {
    const db = await getDB();
    // Check if exists
    const existing = await dailyNutrition.get(data.userId, data.date);
    const key = existing?.id || 0;

    const newKey = await db.put(DB_STORES.DAILY_NUTRITION, { ...data, id: key || undefined });
    console.log('[DB] Daily nutrition saved:', newKey);
    return newKey;
  },

  /**
   * Get nutrition history for a date range
   */
  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<DailyNutrition[]> {
    const db = await getDB();
    const index = db.transaction(DB_STORES.DAILY_NUTRITION).store.index('userId_date');

    const results: DailyNutrition[] = [];
    let cursor = await index.openCursor(IDBKeyRange.bound([userId, startDate], [userId, endDate]));

    while (cursor) {
      results.push(cursor.value);
      cursor = await cursor.continue();
    }

    return results;
  },
};

// ============================================================================
// Cuisine Unlocks Store Operations
// ============================================================================

export const cuisineUnlocks = {
  /**
   * Get all cuisine unlocks for a user
   */
  async getAll(userId: string): Promise<CuisineUnlock[]> {
    const db = await getDB();
    return db.getAllFromIndex(DB_STORES.CUISINE_UNLOCKS, 'userId', userId);
  },

  /**
   * Get or create cuisine unlock
   */
  async getOrCreate(userId: string, cuisineName: string): Promise<CuisineUnlock> {
    const db = await getDB();
    const index = db.transaction(DB_STORES.CUISINE_UNLOCKS).store.index('userId');

    // Search for existing unlock
    let cursor = await index.openCursor(IDBKeyRange.only(userId));
    while (cursor) {
      if (cursor.value.cuisineName === cuisineName) {
        return cursor.value;
      }
      cursor = await cursor.continue();
    }

    // Create new unlock
    const newUnlock: CuisineUnlock = {
      userId,
      cuisineName,
      firstMealAt: new Date().toISOString(),
      mealCount: 1,
    };

    const key = await db.add(DB_STORES.CUISINE_UNLOCKS, newUnlock);
    console.log('[DB] Cuisine unlock created:', key);
    return { ...newUnlock, id: key };
  },

  /**
   * Increment meal count for a cuisine
   */
  async incrementMealCount(userId: string, cuisineName: string): Promise<void> {
    const unlock = await cuisineUnlocks.getOrCreate(userId, cuisineName);
    unlock.mealCount++;

    const db = await getDB();
    await db.put(DB_STORES.CUISINE_UNLOCKS, unlock);
    console.log('[DB] Cuisine meal count incremented:', cuisineName);
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear all data (useful for logout/debugging)
 */
export async function clearAll(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([DB_STORES.USERS, DB_STORES.MEALS, DB_STORES.SYNC_QUEUE], 'readwrite');

  await Promise.all([
    tx.objectStore(DB_STORES.USERS).clear(),
    tx.objectStore(DB_STORES.MEALS).clear(),
    tx.objectStore(DB_STORES.SYNC_QUEUE).clear(),
  ]);

  await tx.done;
  console.log('[DB] All data cleared');
}

/**
 * Get database size estimate (in bytes)
 */
export async function getDbSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}

// Export all operations as default object
const db = {
  users,
  meals,
  syncQueue,
  dailyNutrition,
  cuisineUnlocks,
  close: closeDB,
  clearAll,
  getDbSize,
};

export default db;
