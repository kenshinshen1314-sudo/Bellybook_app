/**
 * Authentication Service for Bellybook App
 * Handles user registration, login, logout, and session management
 */

import { generateId } from '@/db/schema';

// ============================================================================
// Types
// ============================================================================

export interface AuthUser {
  id: string;
  username: string;
  passwordHash: string; // Simple hash (in production, use bcrypt)
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthSession {
  userId: string;
  username: string;
  displayName: string;
  token: string;
}

// ============================================================================
// Storage Keys (localStorage)
// ============================================================================

const STORAGE_KEYS = {
  USERS: 'bellybook_users',
  CURRENT_SESSION: 'bellybook_session',
} as const;

// ============================================================================
// Simple Password Hashing (for demo purposes only)
// ============================================================================

/**
 * Simple hash function for demo purposes
 * In production, use bcrypt or similar secure hashing
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'bellybook-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password against hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// ============================================================================
// User Storage (localStorage)
// ============================================================================

/**
 * Get all users from localStorage
 */
function getAllUsers(): AuthUser[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save all users to localStorage
 */
function saveAllUsers(users: AuthUser[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/**
 * Get user by username
 */
function getUserByUsername(username: string): AuthUser | undefined {
  const users = getAllUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

/**
 * Get user by ID
 */
function getUserById(userId: string): AuthUser | undefined {
  const users = getAllUsers();
  return users.find(u => u.id === userId);
}

/**
 * Save user to storage
 */
function saveUser(user: AuthUser): void {
  const users = getAllUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);

  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }

  saveAllUsers(users);
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Get current session from localStorage
 */
export function getCurrentSession(): AuthSession | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Save session to localStorage
 */
function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
}

/**
 * Clear session from localStorage
 */
function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
}

/**
 * Generate session token
 */
function generateToken(): string {
  return generateId('token');
}

// ============================================================================
// Auth Service API
// ============================================================================

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthSession> {
  // Validate input
  if (!data.username || data.username.trim().length < 3) {
    throw new Error('Username must be at least 3 characters');
  }

  if (!data.password || data.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Check if username already exists
  const existingUser = getUserByUsername(data.username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Create new user
  const userId = generateId('user');
  const passwordHash = await hashPassword(data.password);

  const newUser: AuthUser = {
    id: userId,
    username: data.username.trim(),
    passwordHash,
    displayName: data.displayName?.trim() || data.username.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save user
  saveUser(newUser);

  // Create session
  const session: AuthSession = {
    userId: newUser.id,
    username: newUser.username,
    displayName: newUser.displayName,
    token: generateToken(),
  };

  saveSession(session);

  return session;
}

/**
 * Login with username and password
 */
export async function login(data: LoginData): Promise<AuthSession> {
  // Validate input
  if (!data.username || !data.password) {
    throw new Error('Username and password are required');
  }

  // Find user
  const user = getUserByUsername(data.username);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Verify password
  const isValid = await verifyPassword(data.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid username or password');
  }

  // Create session
  const session: AuthSession = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    token: generateToken(),
  };

  saveSession(session);

  return session;
}

/**
 * Logout current user
 */
export function logout(): void {
  clearSession();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const session = getCurrentSession();
  return session !== null;
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): AuthSession | null {
  return getCurrentSession();
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<Pick<AuthUser, 'displayName'>>): Promise<void> {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (updates.displayName) {
    user.displayName = updates.displayName.trim();
  }

  user.updatedAt = new Date().toISOString();
  saveUser(user);

  // Update session if it's the current user
  const session = getCurrentSession();
  if (session && session.userId === userId) {
    const updatedSession: AuthSession = {
      ...session,
      displayName: user.displayName,
    };
    saveSession(updatedSession);
  }
}
