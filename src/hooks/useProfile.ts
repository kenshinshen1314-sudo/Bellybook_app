import { useState, useEffect, useCallback } from 'react';
import { users, type UserProfile, type UserSettings } from '@/db';

interface UseProfileResult {
  profile: UserProfile | null;
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  saveProfile: (profile: UserProfile) => Promise<void>;
  saveSettings: (settings: UserSettings) => Promise<void>;
  updateTheme: (theme: 'light' | 'dark' | 'auto') => Promise<void>;
  updateLanguage: (language: 'zh' | 'en') => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULT_USER_ID = 'current-user';

/**
 * Hook for managing user profile and settings
 * Data is persisted to IndexedDB
 */
export function useProfile(userId: string = DEFAULT_USER_ID): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user data from IndexedDB
   */
  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await users.get(userId);

      if (data) {
        setProfile(data.profile);
        setSettings(data.settings);

        // Apply theme to document
        if (data.settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (data.settings.theme === 'light') {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Create default user data if not exists
        const defaultProfile: UserProfile = {
          id: userId,
          username: 'User',
          displayName: '美食家',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const defaultSettings: UserSettings = {
          id: userId,
          language: 'zh',
          theme: 'light',
          notificationsEnabled: true,
        };

        await users.set(userId, { profile: defaultProfile, settings: defaultSettings });
        setProfile(defaultProfile);
        setSettings(defaultSettings);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('[useProfile] Error loading user data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Save profile to IndexedDB
   */
  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    setError(null);

    try {
      const currentSettings = settings || {
        id: userId,
        language: 'zh',
        theme: 'light' as const,
        notificationsEnabled: true,
      };

      const updatedProfile = {
        ...newProfile,
        updatedAt: new Date().toISOString(),
      };

      await users.set(userId, { profile: updatedProfile, settings: currentSettings });
      setProfile(updatedProfile);

      console.log('[useProfile] Profile saved:', updatedProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);
      console.error('[useProfile] Error saving profile:', err);
      throw err;
    }
  }, [userId, settings]);

  /**
   * Save settings to IndexedDB
   */
  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    setError(null);

    try {
      const currentProfile = profile || {
        id: userId,
        username: 'User',
        displayName: '美食家',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await users.set(userId, { profile: currentProfile, settings: newSettings });
      setSettings(newSettings);

      // Apply theme to document
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (newSettings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      }

      console.log('[useProfile] Settings saved:', newSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      console.error('[useProfile] Error saving settings:', err);
      throw err;
    }
  }, [userId, profile]);

  /**
   * Update theme setting
   */
  const updateTheme = useCallback(async (theme: 'light' | 'dark' | 'auto') => {
    if (!settings) return;

    const updatedSettings: UserSettings = {
      ...settings,
      theme,
    };

    await saveSettings(updatedSettings);
  }, [settings, saveSettings]);

  /**
   * Update language setting
   */
  const updateLanguage = useCallback(async (language: 'zh' | 'en') => {
    if (!settings) return;

    const updatedSettings: UserSettings = {
      ...settings,
      language,
    };

    await saveSettings(updatedSettings);
  }, [settings, saveSettings]);

  /**
   * Refresh user data from IndexedDB
   */
  const refresh = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  // Load data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    profile,
    settings,
    isLoading,
    error,
    saveProfile,
    saveSettings,
    updateTheme,
    updateLanguage,
    refresh,
  };
}

/**
 * Convenience function to save user profile (for use outside React components)
 */
export async function saveProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const currentData = await users.get(userId);

  if (!currentData) {
    throw new Error('User not found. Please initialize user data first.');
  }

  const updatedProfile: UserProfile = {
    ...currentData.profile,
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  await users.set(userId, { profile: updatedProfile, settings: currentData.settings });
}

/**
 * Convenience function to save user settings (for use outside React components)
 */
export async function saveSettings(userId: string, newSettings: Partial<UserSettings>): Promise<void> {
  const currentData = await users.get(userId);

  if (!currentData) {
    throw new Error('User not found. Please initialize user data first.');
  }

  const updatedSettings: UserSettings = {
    ...currentData.settings,
    ...newSettings,
  };

  await users.set(userId, { profile: currentData.profile, settings: updatedSettings });
}

/**
 * Convenience function to load user profile (for use outside React components)
 */
export async function loadProfile(userId: string = DEFAULT_USER_ID): Promise<{
  profile: UserProfile;
  settings: UserSettings;
} | null> {
  return users.get(userId) || null;
}
