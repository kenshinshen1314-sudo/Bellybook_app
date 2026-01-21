/**
 * useConflicts Hook
 *
 * React hook for managing conflict resolution
 */

import { useCallback, useEffect, useState } from 'react';
import { getConflictResolver, destroyConflictResolver } from '@/conflict/resolver';
import type { Conflict, ConflictResolution, ConflictStrategy } from '@/conflict/types';
import type { MealConflictInfo, ProfileConflictInfo, SettingsConflictInfo } from '@/conflict/types';

export interface UseConflictsReturn {
  /** List of all conflicts */
  conflicts: Conflict[];
  /** Only pending conflicts */
  pendingConflicts: Conflict[];
  /** Conflict statistics */
  stats: {
    total: number;
    pending: number;
    resolved: number;
    ignored: number;
    byType: Record<string, number>;
    byEntityType: Record<string, number>;
  };
  /** Resolve a single conflict */
  resolveConflict: (conflictId: string, resolution: ConflictResolution) => Promise<void>;
  /** Resolve all conflicts with a strategy */
  resolveAllWithStrategy: (strategy: ConflictStrategy) => Promise<void>;
  /** Ignore a conflict */
  ignoreConflict: (conflictId: string) => void;
  /** Get conflict info for display */
  getConflictInfo: (conflict: Conflict) => MealConflictInfo | ProfileConflictInfo | SettingsConflictInfo | null;
  /** Clear all conflicts */
  clearConflicts: () => void;
}

/**
 * Hook for managing conflicts
 */
export function useConflicts(): UseConflictsReturn {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [resolver, setResolver] = useState(() => getConflictResolver());

  useEffect(() => {
    // Subscribe to conflict updates
    const unsubscribe = resolver.subscribe((newConflicts) => {
      setConflicts(newConflicts);
    });

    // Get initial conflicts
    setConflicts(Array.from(resolver.getPendingConflicts()));

    return () => {
      unsubscribe();
    };
  }, [resolver]);

  const stats = resolver.getStats();
  const pendingConflicts = conflicts.filter((c) => c.status === 'PENDING');

  const resolveConflict = useCallback(async (conflictId: string, resolution: ConflictResolution) => {
    switch (resolution.strategy) {
      case 'LAST_WRITE_WINS':
        resolver.resolveLastWriteWins(conflictId);
        break;
      case 'SERVER_WINS':
        resolver.resolveServerWins(conflictId);
        break;
      case 'CLIENT_WINS':
        resolver.resolveClientWins(conflictId);
        break;
      case 'MANUAL':
        resolver.resolveManually(conflictId, resolution.keepVersion!, resolution.mergedData);
        break;
    }
  }, [resolver]);

  const resolveAllWithStrategy = useCallback(async (strategy: ConflictStrategy) => {
    switch (strategy) {
      case 'LAST_WRITE_WINS':
      case 'SERVER_WINS':
      case 'CLIENT_WINS':
        resolver.autoResolveAll();
        break;
      default:
        console.warn('[useConflicts] Cannot auto-resolve with MANUAL strategy');
    }
  }, [resolver]);

  const ignoreConflict = useCallback((conflictId: string) => {
    resolver.ignoreConflict(conflictId);
  }, [resolver]);

  const getConflictInfo = useCallback((conflict: Conflict) => {
    switch (conflict.entityType) {
      case 'meal':
        // Get food name from dishes array (new format) or fallback to foodName (old format)
        const getFoodName = (analysis: any) =>
          analysis?.dishes?.[0]?.foodName || analysis?.foodName || 'Unknown';

        return {
          mealId: conflict.entityId,
          foodName: getFoodName(conflict.clientData.analysis) || getFoodName(conflict.serverData.analysis) || 'Unknown',
          clientChanges: {
            mealType: conflict.clientData.mealType,
            notes: conflict.clientData.notes,
            imageUrl: conflict.clientData.imageUrl,
            analysis: conflict.clientData.analysis,
          },
          serverChanges: {
            mealType: conflict.serverData.mealType,
            notes: conflict.serverData.notes,
            imageUrl: conflict.serverData.imageUrl,
            analysis: conflict.serverData.analysis,
          },
          conflictingFields: [] // Would be computed by comparing client/server changes
        } as MealConflictInfo;

      case 'profile':
        return {
          userId: conflict.entityId,
          displayName: conflict.clientData.displayName || conflict.serverData.displayName || 'User',
          clientChanges: {
            displayName: conflict.clientData.displayName,
            bio: conflict.clientData.bio,
            avatarUrl: conflict.clientData.avatarUrl,
          },
          serverChanges: {
            displayName: conflict.serverData.displayName,
            bio: conflict.serverData.bio,
            avatarUrl: conflict.serverData.avatarUrl,
          },
          conflictingFields: []
        } as ProfileConflictInfo;

      case 'settings':
        return {
          userId: conflict.entityId,
          clientChanges: {
            language: conflict.clientData.language,
            theme: conflict.clientData.theme,
            notificationsEnabled: conflict.clientData.notificationsEnabled,
          },
          serverChanges: {
            language: conflict.serverData.language,
            theme: conflict.serverData.theme,
            notificationsEnabled: conflict.serverData.notificationsEnabled,
          },
          conflictingFields: []
        } as SettingsConflictInfo;

      default:
        return null;
    }
  }, []);

  const clearConflicts = useCallback(() => {
    resolver.clearConflicts();
  }, [resolver]);

  return {
    conflicts,
    pendingConflicts,
    stats,
    resolveConflict,
    resolveAllWithStrategy,
    ignoreConflict,
    getConflictInfo,
    clearConflicts,
  };
}
