/**
 * API Types and Interfaces
 */

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * JWT token pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/**
 * User credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Meal API types
 */
export interface CreateMealDto {
  imageUrl: string;
  analysis: {
    foodName: string;
    cuisine?: string;
    plating?: string;
    sensory?: string;
    container?: string;
    description?: string;
    nutrition: {
      calories: number;
      protein: number;
      fat: number;
      carbohydrates: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
    };
    suggestions?: string[];
  };
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
}

export interface UpdateMealDto {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
}

export interface MealResponse {
  id: string;
  userId: string;
  imageUrl: string;
  analysis: any;
  mealType?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

/**
 * Profile API types
 */
export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateSettingsDto {
  language?: 'zh' | 'en';
  theme?: 'light' | 'dark' | 'auto';
  notificationsEnabled?: boolean;
  reminderTime?: string;
}

/**
 * Sync API types
 */
export interface SyncPullParams {
  lastSyncAt?: string;
  includeMeals?: boolean;
  includeProfile?: boolean;
}

export interface SyncPullResponse {
  meals: MealResponse[];
  profile?: any;
  settings?: any;
  serverTime: string;
}

export interface SyncPushItem {
  type: 'CREATE_MEAL' | 'UPDATE_MEAL' | 'DELETE_MEAL' | 'UPDATE_PROFILE' | 'UPDATE_SETTINGS';
  payload: any;
  clientId: string;
}

export interface SyncPushResponse {
  success: string[];
  failed: Array<{ clientId: string; error: string }>;
  serverTime: string;
}
