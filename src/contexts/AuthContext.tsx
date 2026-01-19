/**
 * Authentication Context for Bellybook App
 * Provides authentication state and actions to all components
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as authService from '@/services/authService';
import type { AuthSession, RegisterData, LoginData } from '@/services/authService';
import { users, meals, dailyNutrition, cuisineUnlocks } from '@/db';

// ============================================================================
// Types
// ============================================================================

interface AuthContextValue {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthSession | null;

  // Actions
  register: (data: RegisterData) => Promise<AuthSession>;
  login: (data: LoginData) => Promise<AuthSession>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;

  // Migration
  migrateOfflineData: (userId: string) => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: check if user is already logged in
  useEffect(() => {
    const initAuth = () => {
      try {
        const session = authService.getCurrentUser();
        if (session) {
          console.log('[Auth] User already logged in:', session.username);
          setUser(session);
        }
      } catch (error) {
        console.error('[Auth] Failed to check authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Register a new user
   */
  const register = useCallback(async (data: RegisterData): Promise<AuthSession> => {
    setIsLoading(true);
    try {
      const session = await authService.register(data);
      setUser(session);
      console.log('[Auth] User registered:', session.username);

      // Create user profile in IndexedDB
      await users.set(session.userId, {
        profile: {
          id: session.userId,
          username: session.username,
          displayName: session.displayName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        settings: {
          id: session.userId,
          language: 'zh',
          theme: 'light',
          notificationsEnabled: true,
        },
      });

      console.log('[Auth] User profile created in IndexedDB');

      // Auto-migrate offline data from 'current-user' to the new user
      await migrateOfflineData(session.userId);

      return session;
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Login with username and password
   */
  const login = useCallback(async (data: LoginData): Promise<AuthSession> => {
    setIsLoading(true);
    try {
      const session = await authService.login(data);
      setUser(session);
      console.log('[Auth] User logged in:', session.username);

      // Ensure user profile exists in IndexedDB
      const existingProfile = await users.get(session.userId);
      if (!existingProfile) {
        await users.set(session.userId, {
          profile: {
            id: session.userId,
            username: session.username,
            displayName: session.displayName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          settings: {
            id: session.userId,
            language: 'zh',
            theme: 'light',
            notificationsEnabled: true,
          },
        });
        console.log('[Auth] User profile created in IndexedDB');
      }

      // Auto-migrate offline data from 'current-user' to the logged-in user
      await migrateOfflineData(session.userId);

      return session;
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      console.log('[Auth] User logged out');
    } catch (error) {
      console.error('[Auth] Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (displayName: string) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);
    try {
      await authService.updateProfile(user.userId, { displayName });

      // Update IndexedDB profile
      const existingData = await users.get(user.userId);
      if (existingData) {
        await users.set(user.userId, {
          ...existingData,
          profile: {
            ...existingData.profile,
            displayName,
            updatedAt: new Date().toISOString(),
          },
        });
      }

      // Update session state
      setUser({
        ...user,
        displayName,
      });

      console.log('[Auth] Profile updated');
    } catch (error) {
      console.error('[Auth] Profile update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Migrate offline data (from 'current-user' to the logged-in user)
   */
  const migrateOfflineData = useCallback(async (userId: string) => {
    const OFFLINE_USER_ID = 'current-user';

    try {
      console.log('[Auth] Starting data migration from', OFFLINE_USER_ID, 'to', userId);

      // Check if there's data to migrate
      const offlineMeals = await meals.getAll(OFFLINE_USER_ID);

      if (offlineMeals.length === 0) {
        console.log('[Auth] No offline data to migrate');
        return;
      }

      console.log('[Auth] Migrating', offlineMeals.length, 'meals');

      // Migrate each meal
      for (const meal of offlineMeals) {
        const updatedMeal = {
          ...meal,
          userId: userId,
          updatedAt: new Date().toISOString(),
        };
        await meals.update(updatedMeal);
      }

      // Migrate daily nutrition data
      const offlineDb = await (await import('@/db')).getDB();
      const dailyNutritionTx = offlineDb.transaction('dailyNutrition', 'readwrite');
      const dailyNutritionStore = dailyNutritionTx.objectStore('dailyNutrition');
      const dailyIndex = dailyNutritionStore.index('userId');

      let cursor = await dailyIndex.openCursor(IDBKeyRange.only(OFFLINE_USER_ID));
      while (cursor) {
        const record = cursor.value;
        record.userId = userId;
        await dailyNutritionStore.put(record);
        cursor = await cursor.continue();
      }
      await dailyNutritionTx.done;

      // Migrate cuisine unlocks
      const cuisineTx = offlineDb.transaction('cuisineUnlocks', 'readwrite');
      const cuisineStore = cuisineTx.objectStore('cuisineUnlocks');
      const cuisineIndex = cuisineStore.index('userId');

      cursor = await cuisineIndex.openCursor(IDBKeyRange.only(OFFLINE_USER_ID));
      while (cursor) {
        const record = cursor.value;
        record.userId = userId;
        await cuisineStore.put(record);
        cursor = await cursor.continue();
      }
      await cuisineTx.done;

      console.log('[Auth] Data migration completed');
    } catch (error) {
      console.error('[Auth] Data migration failed:', error);
      throw error;
    }
  }, []);

  // Context value
  const value: AuthContextValue = {
    isAuthenticated: !!user,
    isLoading,
    user,
    register,
    login,
    logout,
    updateProfile,
    migrateOfflineData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * useAuth hook - Access the AuthContext
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Convenience hook to get just the authentication state
 */
export function useAuthState() {
  const { isAuthenticated, isLoading, user } = useAuth();
  return { isAuthenticated, isLoading, user };
}
