/**
 * IndexedDB Database Schema for Bellybook App
 *
 * Database Name: bellybook-db
 * Version: 1
 */

// ============================================================================
// Types
// ============================================================================

/**
 * User profile data stored in IndexedDB
 */
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * User settings/preferences
 */
export interface UserSettings {
  id: string; // Same as userProfile.id
  language: 'zh' | 'en';
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  breakfastReminderTime?: string; // HH:mm format
  lunchReminderTime?: string; // HH:mm format
  dinnerReminderTime?: string; // HH:mm format
  hideRanking?: boolean; // Privacy setting
  premiumExpiresAt?: string | null; // ISO timestamp or null
}

/**
 * Combined user data (profile + settings)
 */
export interface UserData {
  profile: UserProfile;
  settings: UserSettings;
}

/**
 * Nutrition information for a meal
 */
export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  fat: number; // grams
  carbohydrates: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
}

/**
 * AI Analysis result for a food image
 */
/**
 * Ingredient information for a meal
 */
export interface IngredientInfo {
  name: string;
  percentage: number;
  icon?: string; // Emoji or icon identifier
  description?: string; // Brief description of the ingredient
}

/**
 * AI Analysis result for a food image
 */
export interface MealAnalysis {
  foodName: string;
  cuisine?: string;
  plating?: string;
  sensory?: string;
  container?: string;
  description?: string;
  nutrition: NutritionInfo;
  ingredients?: IngredientInfo[];
  suggestions?: string[];
  poeticDescription?: string;
  nutritionCommentary?: string;
  analyzedAt: string; // ISO timestamp
}

/**
 * Meal record
 */
export interface Meal {
  id: string;
  userId: string;
  imageUrl: string; // Base64 or blob URL
  imageBlob?: Blob; // For offline storage
  thumbnailUrl?: string; // Thumbnail URL for list view
  analysis: MealAnalysis;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  syncedAt?: string; // ISO timestamp when synced to server
  isSynced: boolean;
}

/**
 * Sync queue operation types
 */
export type SyncOperationType =
  | 'CREATE_MEAL'
  | 'UPDATE_MEAL'
  | 'DELETE_MEAL'
  | 'UPDATE_PROFILE'
  | 'UPDATE_SETTINGS';

/**
 * Sync queue item for offline-first operation
 */
export interface SyncQueueItem {
  id: string;
  type: SyncOperationType;
  payload: any;
  userId: string;
  createdAt: string; // ISO timestamp
  retryCount: number;
  lastError?: string;
}

/**
 * Daily nutrition summary
 */
export interface DailyNutrition {
  date: string; // YYYY-MM-DD format
  userId: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbohydrates: number;
  mealCount: number;
}

/**
 * Cuisine unlock status
 */
export interface CuisineUnlock {
  id?: number; // Auto-incremented ID (optional for new records)
  userId: string;
  cuisineName: string;
  firstMealAt: string; // ISO timestamp
  mealCount: number;
}

// ============================================================================
// IndexedDB Schema Definition
// ============================================================================

/**
 * Database stores configuration
 */
export const DB_STORES = {
  USERS: 'users',
  MEALS: 'meals',
  SYNC_QUEUE: 'syncQueue',
  DAILY_NUTRITION: 'dailyNutrition',
  CUISINE_UNLOCKS: 'cuisineUnlocks',
} as const;

/**
 * Database name and version
 */
export const DB_CONFIG = {
  name: 'bellybook-db',
  version: 1,
} as const;

/**
 * IndexedDB upgrade handler
 * This function creates all object stores and indexes when the DB is first opened or upgraded
 */
export function createObjectStores(db: IDBDatabase): void {
  // Users store
  if (!db.objectStoreNames.contains(DB_STORES.USERS)) {
    const usersStore = db.createObjectStore(DB_STORES.USERS, { keyPath: 'id' });
    usersStore.createIndex('createdAt', 'profile.createdAt');
    usersStore.createIndex('username', 'profile.username');
  }

  // Meals store
  if (!db.objectStoreNames.contains(DB_STORES.MEALS)) {
    const mealsStore = db.createObjectStore(DB_STORES.MEALS, { keyPath: 'id' });
    mealsStore.createIndex('userId', 'userId');
    mealsStore.createIndex('createdAt', 'createdAt');
    mealsStore.createIndex('date', 'createdAt'); // For date range queries
    mealsStore.createIndex('synced', 'isSynced');
    mealsStore.createIndex('userId_date', ['userId', 'createdAt']); // Compound index
  }

  // Sync queue store
  if (!db.objectStoreNames.contains(DB_STORES.SYNC_QUEUE)) {
    const syncStore = db.createObjectStore(DB_STORES.SYNC_QUEUE, { keyPath: 'id' });
    syncStore.createIndex('createdAt', 'createdAt');
    syncStore.createIndex('type', 'type');
    syncStore.createIndex('userId', 'userId');
  }

  // Daily nutrition store
  if (!db.objectStoreNames.contains(DB_STORES.DAILY_NUTRITION)) {
    const dailyStore = db.createObjectStore(DB_STORES.DAILY_NUTRITION, { keyPath: 'id', autoIncrement: true });
    dailyStore.createIndex('date', 'date');
    dailyStore.createIndex('userId', 'userId');
    dailyStore.createIndex('userId_date', ['userId', 'date']); // Compound index
  }

  // Cuisine unlocks store
  if (!db.objectStoreNames.contains(DB_STORES.CUISINE_UNLOCKS)) {
    const cuisineStore = db.createObjectStore(DB_STORES.CUISINE_UNLOCKS, { keyPath: 'id', autoIncrement: true });
    cuisineStore.createIndex('userId', 'userId');
    cuisineStore.createIndex('cuisine', 'cuisineName');
  }
}

/**
 * Data migration strategy
 * Increment version number when schema changes and handle migrations here
 */
export function handleMigration(db: IDBDatabase, oldVersion: number, newVersion: number): void {
  console.log(`[DB] Migrating from version ${oldVersion} to ${newVersion}`);

  // Example migration from version 1 to 2
  // if (oldVersion < 2) {
  //   // Add new index to meals store
  //   const mealsStore = db.transaction(DB_STORES.MEALS, 'versionchange').objectStore(DB_STORES.MEALS);
  //   mealsStore.createIndex('mealType', 'mealType');
  // }
}

// ============================================================================
// Value Objects (for type safety)
// ============================================================================

/**
 * Generate a unique ID for new records
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a daily nutrition ID
 */
export function createDailyNutritionId(userId: string, date: string): string {
  return `${userId}_${date}`;
}
