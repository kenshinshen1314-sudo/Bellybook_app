/**
 * Profile Edit Component
 * Allows users to edit their display name and bio
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import * as api from '@/api';
import { Language, Theme } from '@/types';
import type { UserProfile } from '@/db';

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
      console.error('[ProfileEdit] Profile not loaded');
      return;
    }

    console.log('[ProfileEdit] Starting profile save...');
    console.log('[ProfileEdit] Current values:', { displayName: profile.displayName, bio: profile.bio });
    console.log('[ProfileEdit] New values:', { displayName: editDisplayName, bio: editBio });

    setIsSaving(true);
    try {
      // 1. Save to IndexedDB (local cache)
      console.log('[ProfileEdit] Saving to IndexedDB...');
      await saveProfile({
        ...profile,
        displayName: editDisplayName,
        bio: editBio,
      });
      console.log('[ProfileEdit] IndexedDB saved successfully');

      // 2. Update backend API (sync to Supabase)
      console.log('[ProfileEdit] Calling backend API /users/profile...');
      try {
        const updateData = {
          displayName: editDisplayName,
          bio: editBio,
        };
        console.log('[ProfileEdit] Update data:', updateData);
        const response = await api.profile.update(updateData);
        console.log('[ProfileEdit] Backend API response:', response);
        console.log('[ProfileEdit] Backend updated successfully');
      } catch (apiError: any) {
        console.error('[ProfileEdit] Backend update failed (will sync later):', apiError);
        console.error('[ProfileEdit] Error name:', apiError?.name);
        console.error('[ProfileEdit] Error message:', apiError?.message);
        console.error('[ProfileEdit] Error status:', apiError?.status);
        console.error('[ProfileEdit] Error code:', apiError?.code);
        console.error('[ProfileEdit] Error details:', apiError?.details);
        console.error('[ProfileEdit] Full error:', JSON.stringify(apiError, Object.getOwnPropertyNames(apiError), 2));
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
      console.error('[ProfileEdit] Failed to save profile:', error);
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
        <div className={`flex justify-between p-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
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
