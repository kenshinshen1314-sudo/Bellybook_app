/**
 * Authentication Service for Bellybook App
 * Handles user registration, login, logout, and session management
 * using the backend API
 */

import * as authApi from '@/api/auth';
import type { AuthSession } from '@/api/auth';

// ============================================================================
// Types
// ============================================================================

export type { AuthSession };

export interface RegisterData {
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// ============================================================================
// Auth Service API (Backend Integration)
// ============================================================================

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthSession> {
  // Backend validation: username min 3 chars, password min 8 chars
  if (!data.username || data.username.trim().length < 3) {
    throw new Error('Username must be at least 3 characters');
  }

  if (!data.password || data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  // Call backend API
  return authApi.register({
    username: data.username.trim(),
    password: data.password,
    displayName: data.displayName?.trim(),
  });
}

/**
 * Login with username and password
 */
export async function login(data: LoginData): Promise<AuthSession> {
  // Validate input
  if (!data.username || !data.password) {
    throw new Error('Username and password are required');
  }

  // Call backend API
  return authApi.login({
    username: data.username.trim(),
    password: data.password,
  });
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  await authApi.logout();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return authApi.isAuthenticated();
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): AuthSession | null {
  return authApi.getCurrentSession();
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<{ displayName: string }>): Promise<void> {
  if (updates.displayName) {
    await authApi.updateProfile({ displayName: updates.displayName.trim() });
  }
}
