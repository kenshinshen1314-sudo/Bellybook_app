/**
 * Conflict Resolver
 *
 * Handles detection and resolution of conflicts between local and remote data
 */

import { generateId } from '@/db/schema';
import type {
  Conflict,
  ConflictType,
  ConflictStrategy,
  ConflictStatus,
  ConflictDetection,
  ConflictResolverOptions,
  ConflictResolution,
} from './types';

/**
 * Default resolver options
 */
const DEFAULT_OPTIONS: ConflictResolverOptions = {
  defaultStrategy: 'LAST_WRITE_WINS',
  autoResolve: false,
  notifyUser: true,
};

/**
 * Conflict Resolver class
 */
export class ConflictResolver {
  private options: ConflictResolverOptions;
  private conflicts: Map<string, Conflict> = new Map();
  private listeners: Set<(conflicts: Conflict[]) => void> = new Set();

  constructor(options: ConflictResolverOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Subscribe to conflict notifications
   */
  subscribe(callback: (conflicts: Conflict[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    this.listeners.forEach((callback) => callback(Array.from(this.conflicts.values())));
  }

  /**
   * Get all pending conflicts
   */
  getPendingConflicts(): Conflict[] {
    return Array.from(this.conflicts.values()).filter((c) => c.status === 'PENDING');
  }

  /**
   * Get conflict by ID
   */
  getConflict(conflictId: string): Conflict | undefined {
    return this.conflicts.get(conflictId);
  }

  /**
   * Detect conflicts between client and server data
   */
  detectConflict(
    entityType: 'meal' | 'profile' | 'settings',
    entityId: string,
    clientData: any,
    serverData: any
  ): ConflictDetection {
    // If no server data exists, no conflict
    if (!serverData) {
      return { hasConflict: false };
    }

    const clientUpdatedAt = new Date(clientData.updatedAt || clientData.createdAt);
    const serverUpdatedAt = new Date(serverData.updatedAt || serverData.createdAt);

    // Check if both versions were modified (roughly same time)
    const timeDiff = Math.abs(clientUpdatedAt.getTime() - serverUpdatedAt.getTime());
    const threshold = 1000; // 1 second threshold

    if (timeDiff < threshold) {
      // Concurrent modification detected
      const conflict = this.createConflict({
        type: 'SAME_RECORD_CONCURRENT',
        entityType,
        entityId,
        clientData,
        serverData,
        clientUpdatedAt: clientData.updatedAt || clientData.createdAt,
        serverUpdatedAt: serverData.updatedAt || serverData.createdAt,
      });

      this.conflicts.set(conflict.id, conflict);
      this.notify();

      return {
        hasConflict: true,
        conflict,
      };
    }

    // No conflict
    return { hasConflict: false };
  }

  /**
   * Create a conflict record
   */
  private createConflict(options: {
    type: ConflictType;
    entityType: 'meal' | 'profile' | 'settings';
    entityId: string;
    clientData: any;
    serverData: any;
    clientUpdatedAt: string;
    serverUpdatedAt: string;
    context?: any;
  }): Conflict {
    return {
      id: generateId('conflict'),
      type: options.type,
      entityType: options.entityType,
      entityId: options.entityId,
      clientData: options.clientData,
      serverData: options.serverData,
      clientUpdatedAt: options.clientUpdatedAt,
      serverUpdatedAt: options.serverUpdatedAt,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      context: options.context,
    };
  }

  /**
   * Resolve conflict using Last Write Wins strategy
   */
  resolveLastWriteWins(conflictId: string): ConflictResolution {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    const clientTime = new Date(conflict.clientUpdatedAt).getTime();
    const serverTime = new Date(conflict.serverUpdatedAt).getTime();
    const keepVersion = clientTime > serverTime ? 'CLIENT' : 'SERVER';

    return this.applyResolution(conflictId, {
      strategy: 'LAST_WRITE_WINS',
      keepVersion,
    });
  }

  /**
   * Resolve conflict using Server Wins strategy
   */
  resolveServerWins(conflictId: string): ConflictResolution {
    return this.applyResolution(conflictId, {
      strategy: 'SERVER_WINS',
      keepVersion: 'SERVER',
    });
  }

  /**
   * Resolve conflict using Client Wins strategy
   */
  resolveClientWins(conflictId: string): ConflictResolution {
    return this.applyResolution(conflictId, {
      strategy: 'CLIENT_WINS',
      keepVersion: 'CLIENT',
    });
  }

  /**
   * Manually resolve conflict
   */
  resolveManually(conflictId: string, keepVersion: 'CLIENT' | 'SERVER' | 'MERGED', mergedData?: any): ConflictResolution {
    return this.applyResolution(conflictId, {
      strategy: 'MANUAL',
      keepVersion,
      mergedData,
    });
  }

  /**
   * Apply resolution to conflict
   */
  private applyResolution(conflictId: string, resolution: Omit<ConflictResolution, 'conflictId'>): ConflictResolution {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    const fullResolution: ConflictResolution = {
      conflictId,
      ...resolution,
    };

    // Update conflict status
    conflict.status = 'RESOLVED';
    conflict.strategy = resolution.strategy;
    conflict.resolvedAt = new Date().toISOString();
    conflict.resolvedWith = resolution.keepVersion;

    this.notify();

    return fullResolution;
  }

  /**
   * Ignore conflict (keep current state)
   */
  ignoreConflict(conflictId: string): void {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    conflict.status = 'IGNORED';
    this.notify();
  }

  /**
   * Get resolved data for a conflict
   */
  getResolvedData(conflict: Conflict, resolution: ConflictResolution): any {
    switch (resolution.keepVersion) {
      case 'CLIENT':
        return conflict.clientData;
      case 'SERVER':
        return conflict.serverData;
      case 'MERGED':
        return resolution.mergedData || conflict.serverData;
      default:
        return conflict.serverData;
    }
  }

  /**
   * Auto-resolve all pending conflicts using default strategy
   */
  autoResolveAll(): ConflictResolution[] {
    const resolutions: ConflictResolution[] = [];

    for (const conflict of this.getPendingConflicts()) {
      let resolution: ConflictResolution;

      switch (this.options.defaultStrategy) {
        case 'LAST_WRITE_WINS':
          resolution = this.resolveLastWriteWins(conflict.id);
          break;
        case 'SERVER_WINS':
          resolution = this.resolveServerWins(conflict.id);
          break;
        case 'CLIENT_WINS':
          resolution = this.resolveClientWins(conflict.id);
          break;
        default:
          // Manual strategy can't auto-resolve
          continue;
      }

      resolutions.push(resolution);
    }

    return resolutions;
  }

  /**
   * Clear all conflicts (resolved and pending)
   */
  clearConflicts(): void {
    this.conflicts.clear();
    this.notify();
  }

  /**
   * Get conflict summary statistics
   */
  getStats(): {
    total: number;
    pending: number;
    resolved: number;
    ignored: number;
    byType: Record<string, number>;
    byEntityType: Record<string, number>;
  } {
    const conflicts = Array.from(this.conflicts.values());

    return {
      total: conflicts.length,
      pending: conflicts.filter((c) => c.status === 'PENDING').length,
      resolved: conflicts.filter((c) => c.status === 'RESOLVED').length,
      ignored: conflicts.filter((c) => c.status === 'IGNORED').length,
      byType: conflicts.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byEntityType: conflicts.reduce((acc, c) => {
        acc[c.entityType] = (acc[c.entityType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

/**
 * Singleton instance
 */
let globalResolver: ConflictResolver | null = null;

export function getConflictResolver(options?: ConflictResolverOptions): ConflictResolver {
  if (!globalResolver) {
    globalResolver = new ConflictResolver(options);
  }
  return globalResolver;
}

export function destroyConflictResolver(): void {
  if (globalResolver) {
    globalResolver.clearConflicts();
    globalResolver = null;
  }
}
