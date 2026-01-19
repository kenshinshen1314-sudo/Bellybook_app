/**
 * Authentication API Client
 * Handles communication with backend authentication endpoints
 */

import { apiClient, tokenManager, ApiRequestError } from './client';
import { parseAuthError } from './errors';
import {
  enableOfflineMode,
  disableOfflineMode,
  isLikelyOffline,
  shouldUseOfflineMode,
  getLastKnownSession,
  createOfflineError,
} from './offlineFallback';
import type { TokenPair } from './types';

// ============================================================================
// Types
// ============================================================================

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  subscriptionTier: 'FREE' | 'PREMIUM' | 'PRO';
  createdAt: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSession {
  userId: string;
  username: string;
  displayName: string;
  email?: string;
  token: string;
}

// ============================================================================
// Auth API Functions
// ============================================================================

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthSession> {
  try {
    const response: AuthResponse = await apiClient.post('/auth/register', data, {
      skipAuth: true,
    });

    // Store tokens
    tokenManager.saveTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
    });

    const session = {
      userId: response.user.id,
      username: response.user.username,
      displayName: response.user.displayName || response.user.username,
      email: response.user.email,
      token: response.accessToken,
    };

    // Enable offline mode with this session
    enableOfflineMode(session);

    return session;
  } catch (error) {
    throw parseAuthError(error);
  }
}

/**
 * Login with username and password
 */
export async function login(data: LoginRequest): Promise<AuthSession> {
  try {
    const response: AuthResponse = await apiClient.post('/auth/login', data, {
      skipAuth: true,
    });

    // Store tokens
    tokenManager.saveTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
    });

    const session = {
      userId: response.user.id,
      username: response.user.username,
      displayName: response.user.displayName || response.user.username,
      email: response.user.email,
      token: response.accessToken,
    };

    // Enable offline mode with this session
    enableOfflineMode(session);

    return session;
  } catch (error) {
    throw parseAuthError(error);
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {}, {});
  } catch (error) {
    console.warn('[Auth API] Logout request failed:', error);
  } finally {
    // Always clear local tokens and offline session
    tokenManager.clearTokens();
    disableOfflineMode();
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
  try {
    return await apiClient.get('/auth/me', {});
  } catch (error) {
    throw parseAuthError(error);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return tokenManager.isAuthenticated();
}

/**
 * Get current session from stored tokens
 */
export function getCurrentSession(): AuthSession | null {
  if (!isAuthenticated()) {
    return null;
  }

  const token = tokenManager.getAccessToken();
  if (!token) {
    return null;
  }

  // Decode JWT to get user info (without verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.sub || payload.userId,
      username: payload.username,
      displayName: payload.displayName || payload.username,
      email: payload.email,
      token,
    };
  } catch {
    return null;
  }
}

/**
 * Update user profile
 * Note: Backend uses /users/profile with PUT method
 */
export async function updateProfile(updates: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<UserProfile> {
  try {
    return await apiClient.put('/users/profile', updates, {});
  } catch (error) {
    throw parseAuthError(error);
  }
}
