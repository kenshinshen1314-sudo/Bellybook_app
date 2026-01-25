/**
 * Offline Fallback for Authentication
 * Provides seamless offline support when backend is unavailable
 */

import { tokenManager } from './client';
import type { AuthSession } from './auth';
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('OfflineFallback');

// ============================================================================
// Offline Storage
// ============================================================================

const OFFLINE_KEYS = {
  PENDING_REGISTRATION: 'bb_pending_registration',
  PENDING_LOGIN: 'bb_pending_login',
  LAST_KNOWN_SESSION: 'bb_last_known_session',
} as const;

// ============================================================================
// Offline Auth Manager
// ============================================================================

/**
 * Store pending registration for when offline
 */
export function storePendingRegistration(data: {
  username: string;
  password: string;
  displayName?: string;
}): void {
  localStorage.setItem(
    OFFLINE_KEYS.PENDING_REGISTRATION,
    JSON.stringify({
      ...data,
      timestamp: Date.now(),
    })
  );
}

/**
 * Get pending registration
 */
export function getPendingRegistration(): {
  username: string;
  password: string;
  displayName?: string;
  timestamp: number;
} | null {
  try {
    const data = localStorage.getItem(OFFLINE_KEYS.PENDING_REGISTRATION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Clear pending registration
 */
export function clearPendingRegistration(): void {
  localStorage.removeItem(OFFLINE_KEYS.PENDING_REGISTRATION);
}

/**
 * Store last known session for offline access
 */
export function storeLastKnownSession(session: AuthSession): void {
  localStorage.setItem(
    OFFLINE_KEYS.LAST_KNOWN_SESSION,
    JSON.stringify({
      ...session,
      timestamp: Date.now(),
    })
  );
}

/**
 * Get last known session (for offline mode)
 */
export function getLastKnownSession(): AuthSession | null {
  try {
    const data = localStorage.getItem(OFFLINE_KEYS.LAST_KNOWN_SESSION);
    if (!data) return null;

    const session = JSON.parse(data);

    // Don't use if older than 7 days
    const age = Date.now() - session.timestamp;
    if (age > 7 * 24 * 60 * 60 * 1000) {
      clearLastKnownSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Clear last known session
 */
export function clearLastKnownSession(): void {
  localStorage.removeItem(OFFLINE_KEYS.LAST_KNOWN_SESSION);
}

/**
 * Check if device is likely offline
 */
export function isLikelyOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Check if should use offline mode
 */
export function shouldUseOfflineMode(): boolean {
  const lastSession = getLastKnownSession();
  const isOffline = isLikelyOffline();

  // Use offline mode if:
  // 1. Device is offline AND
  // 2. We have a previous session
  return isOffline && !!lastSession;
}

/**
 * Create offline session error
 */
export function createOfflineError(): Error {
  const message = 'You appear to be offline. Please check your internet connection.';
  const error = new Error(message);
  (error as any).isOffline = true;
  (error as any).code = 'NETWORK_ERROR';
  return error;
}

/**
 * Store session when online for offline access
 */
export function enableOfflineMode(session: AuthSession): void {
  storeLastKnownSession(session);
}

/**
 * Disable offline mode
 */
export function disableOfflineMode(): void {
  clearLastKnownSession();
  clearPendingRegistration();
}

// ============================================================================
// Sync Queue for Offline Actions
// ============================================================================

interface QueuedAction {
  type: 'REGISTER' | 'LOGIN' | 'LOGOUT' | 'UPDATE_PROFILE';
  data: any;
  timestamp: number;
  retryCount: number;
}

const SYNC_QUEUE_KEY = 'bb_sync_queue';

/**
 * Add action to sync queue
 */
export function queueActionForSync(action: QueuedAction): void {
  const queue = getSyncQueue();
  queue.push(action);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Get sync queue
 */
export function getSyncQueue(): QueuedAction[] {
  try {
    const data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Clear sync queue
 */
export function clearSyncQueue(): void {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

/**
 * Process sync queue when back online
 */
export async function processSyncQueue(
  handlers: {
    onRegister?: (data: any) => Promise<void>;
    onLogin?: (data: any) => Promise<void>;
    onLogout?: () => Promise<void>;
    onUpdateProfile?: (data: any) => Promise<void>;
  }
): Promise<void> {
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const processed: string[] = [];

  for (const action of queue) {
    try {
      switch (action.type) {
        case 'REGISTER':
          if (handlers.onRegister) {
            await handlers.onRegister(action.data);
          }
          break;
        case 'LOGIN':
          if (handlers.onLogin) {
            await handlers.onLogin(action.data);
          }
          break;
        case 'LOGOUT':
          if (handlers.onLogout) {
            await handlers.onLogout();
          }
          break;
        case 'UPDATE_PROFILE':
          if (handlers.onUpdateProfile) {
            await handlers.onUpdateProfile(action.data);
          }
          break;
      }
      processed.push(action.type);
    } catch (error) {
      logger.error(`Failed to process ${action.type}:`, error);
      action.retryCount++;
    }
  }

  // Remove processed actions
  const remaining = queue.filter((a) => !processed.includes(a.type));
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
}

// ============================================================================
// Event Listeners
// ============================================================================

/**
 * Set up online/offline event listeners
 */
export function setupOfflineListeners(): void {
  // When going online, try to process sync queue
  window.addEventListener('online', async () => {
    logger.info('Connection restored');
    // Emit event for app to handle
    window.dispatchEvent(new CustomEvent('auth:online'));
  });

  // When going offline
  window.addEventListener('offline', () => {
    logger.info('Connection lost');
    // Emit event for app to handle
    window.dispatchEvent(new CustomEvent('auth:offline'));
  });
}

// Initialize listeners
if (typeof window !== 'undefined') {
  setupOfflineListeners();
}

// ============================================================================
// Offline Status Hook Utilities
// ============================================================================

/**
 * Get offline status
 */
export function getOfflineStatus(): {
  isOffline: boolean;
  hasOfflineSession: boolean;
  hasPendingActions: boolean;
} {
  return {
    isOffline: isLikelyOffline(),
    hasOfflineSession: !!getLastKnownSession(),
    hasPendingActions: getSyncQueue().length > 0,
  };
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).offlineAuth = {
    getPendingRegistration,
    clearPendingRegistration,
    getLastKnownSession,
    clearLastKnownSession,
    isLikelyOffline,
    shouldUseOfflineMode,
    getSyncQueue,
    clearSyncQueue,
    getOfflineStatus,
    enableOfflineMode,
    disableOfflineMode,
  };
}
