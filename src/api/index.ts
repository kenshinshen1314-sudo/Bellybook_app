/**
 * API Module Index
 *
 * Exports all API functionality
 */

// Re-export types
export type {
  ApiResponse,
  ApiError,
  PaginationParams,
  PaginatedResponse,
  TokenPair,
  LoginCredentials,
  CreateMealDto,
  UpdateMealDto,
  MealResponse,
  UpdateProfileDto,
  UpdateSettingsDto,
  SyncPullParams,
  SyncPullResponse,
  SyncPushItem,
  SyncPushResponse,
} from './types';

// Re-export client utilities
export {
  apiClient,
  tokenManager,
  API_BASE_URL,
  addRequestInterceptor,
  addResponseInterceptor,
} from './client';

export { ApiRequestError } from './client';

// Re-export API modules
export { meals } from './meals';
export { sync } from './sync';
export { auth, profile } from './profile';
