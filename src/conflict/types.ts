/**
 * Conflict Resolution Types
 */

/**
 * Conflict types
 */
export type ConflictType =
  | 'SAME_RECORD_CONCURRENT' // Same record modified on both client and server
  | 'DELETE_CONFLICT' // Record deleted on one side, modified on other
  | 'VERSION_MISMATCH' // Version/timestamp mismatch
  | 'NETWORK_ERROR'; // Network error during sync

/**
 * Conflict resolution strategies
 */
export type ConflictStrategy =
  | 'LAST_WRITE_WINS' // Most recent update wins (based on timestamp)
  | 'SERVER_WINS' // Server version always wins
  | 'CLIENT_WINS' // Client version always wins
  | 'MANUAL'; // User chooses which version to keep

/**
 * Conflict status
 */
export type ConflictStatus =
  | 'PENDING' // Awaiting resolution
  | 'RESOLVED' // Conflict has been resolved
  | 'IGNORED'; // Conflict was ignored

/**
 * Conflict record
 */
export interface Conflict {
  id: string;
  type: ConflictType;
  entityType: 'meal' | 'profile' | 'settings';
  entityId: string;

  // Client version
  clientData: any;
  clientUpdatedAt: string;

  // Server version
  serverData: any;
  serverUpdatedAt: string;

  // Metadata
  status: ConflictStatus;
  strategy?: ConflictStrategy;
  resolvedAt?: string;
  resolvedWith?: 'CLIENT' | 'SERVER' | 'MERGED';
  createdAt: string;

  // Additional context
  context?: {
    operation?: string;
    errorMessage?: string;
  };
}

/**
 * Conflict resolution options
 */
export interface ConflictResolution {
  conflictId: string;
  strategy: ConflictStrategy;
  keepVersion?: 'CLIENT' | 'SERVER' | 'MERGED';
  mergedData?: any; // For manual merge strategy
}

/**
 * Conflict detection result
 */
export interface ConflictDetection {
  hasConflict: boolean;
  conflict?: Conflict;
  resolution?: ConflictResolution;
}

/**
 * Conflict resolver options
 */
export interface ConflictResolverOptions {
  defaultStrategy?: ConflictStrategy;
  autoResolve?: boolean; // Auto-resolve without user intervention
  notifyUser?: boolean; // Show notification to user
}

/**
 * Meal-specific conflict info
 */
export interface MealConflictInfo {
  mealId: string;
  foodName: string;

  // Client changes
  clientChanges: {
    mealType?: string;
    notes?: string;
    imageUrl?: string;
    analysis?: any;
  };

  // Server changes
  serverChanges: {
    mealType?: string;
    notes?: string;
    imageUrl?: string;
    analysis?: any;
  };

  // Which fields were modified on both sides
  conflictingFields: string[];
}

/**
 * Profile conflict info
 */
export interface ProfileConflictInfo {
  userId: string;
  displayName: string;

  clientChanges: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  };

  serverChanges: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  };

  conflictingFields: string[];
}

/**
 * Settings conflict info
 */
export interface SettingsConflictInfo {
  userId: string;

  clientChanges: {
    language?: string;
    theme?: string;
    notificationsEnabled?: boolean;
  };

  serverChanges: {
    language?: string;
    theme?: string;
    notificationsEnabled?: boolean;
  };

  conflictingFields: string[];
}
