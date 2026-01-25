/**
 * Profile Edit Component
 * Allows users to edit their display name and bio
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import * as api from '@/api';
import { Language, Theme } from '@/types';
import type { UserProfile } from '@/db';
import { logger } from '@/utils/logger';

interface ProfileEditProps {
  language: Language;
  theme: Theme;
  profileBgClass: string;
  profileTextClass: string;
  onSave: () => void;
}

export function ProfileEdit({
  language,
  theme,
  profileBgClass,
  profileTextClass,
  onSave,
}: ProfileEditProps) {
  const styles = useThemeStyles(theme);
  const { user } = useAuth();
  const userId = user?.userId || 'current-user';
  const { profile, saveProfile } = useProfile(userId);

  // Local state for editing
  const [editDisplayName, setEditDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  // Update initial values when profile loads
  useEffect(() => {
    if (profile) {
      setEditDisplayName(profile.displayName || user?.displayName || '');
      setEditBio(profile.bio || '');
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!profile) {
      logger.error('Profile not loaded');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Save to IndexedDB (local cache)
      await saveProfile({
        ...profile,
        displayName: editDisplayName,
        bio: editBio,
      });

      // 2. Update backend API (sync to Supabase)
      try {
        const updateData = {
          displayName: editDisplayName,
          bio: editBio,
        };
        await api.profile.update(updateData);
      } catch (apiError: any) {
        logger.warn('Backend update failed (will sync later):', apiError);
        // Continue even if backend fails - it will sync later
      }

      // 3. Update auth context if displayName changed
      if (user && user.displayName !== editDisplayName) {
        // Update the user in localStorage
        const sessionData = localStorage.getItem('bellybook_session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          session.displayName = editDisplayName;
          localStorage.setItem('bellybook_session', JSON.stringify(session));
        }
      }

      onSave();
    } catch (error) {
      logger.error('Failed to save profile:', error);
      throw error; // Re-throw to let caller handle
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-20 px-4 animate-slide-left">
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-700 relative overflow-hidden">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`}
            className="w-full h-full"
            alt="Avatar"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">📷</div>
          </div>
        </div>
      </div>
      <div className={`${profileBgClass} rounded-xl overflow-hidden mb-8`}>
        <div className={`flex justify-between p-4 border-b ${styles.border}`}>
          <span className={profileTextClass}>{language === Language.ZH ? '昵称' : 'Nickname'}</span>
          <input
            type="text"
            className={`${profileTextClass} font-medium bg-transparent outline-none text-right flex-1 ml-4`}
            value={editDisplayName}
            onChange={(e) => setEditDisplayName(e.target.value)}
            placeholder={language === Language.ZH ? '输入昵称' : 'Enter nickname'}
          />
        </div>
        <div className="p-4">
          <span className={`${profileTextClass} block mb-2`}>{language === Language.ZH ? '个人简介' : 'Bio'}</span>
          <textarea
            className="w-full bg-transparent text-muted-foreground h-20 resize-none outline-none"
            placeholder={language === Language.ZH ? '写点什么...' : 'Write something...'}
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
          ></textarea>
        </div>
      </div>
      <Button fullWidth onClick={handleSave} disabled={isSaving}>
        {isSaving ? (language === Language.ZH ? '保存中...' : 'Saving...') : (language === Language.ZH ? '保存' : 'Save')}
      </Button>
    </div>
  );
}
