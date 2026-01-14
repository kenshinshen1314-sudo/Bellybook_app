/**
 * Sync API
 *
 * API endpoints for data synchronization
 */

import { apiClient } from './client';
import type {
  ApiResponse,
  SyncPullParams,
  SyncPullResponse,
  SyncPushItem,
  SyncPushResponse,
} from './types';

/**
 * Sync API endpoints
 */
export const sync = {
  /**
   * Pull remote changes from server
   * Returns meals, profile, and settings updated since lastSyncAt
   */
  pull: async (params?: SyncPullParams): Promise<ApiResponse<SyncPullResponse>> => {
    return apiClient.get<ApiResponse<SyncPullResponse>>('/sync/pull', { params });
  },

  /**
   * Push local changes to server
   * Accepts an array of sync operations to process on the server
   */
  push: async (items: SyncPushItem[]): Promise<ApiResponse<SyncPushResponse>> => {
    return apiClient.post<ApiResponse<SyncPushResponse>>('/sync/push', { items });
  },

  /**
   * Get sync status
   * Returns information about pending sync operations
   */
  getStatus: async (): Promise<
    ApiResponse<{
      pendingItems: number;
      lastSyncAt: string | null;
      serverTime: string;
    }>
  > => {
    return apiClient.get<ApiResponse<any>>('/sync/status');
  },

  /**
   * Full sync - pull then push
   * Performs bidirectional synchronization
   */
  fullSync: async (
    params?: SyncPullParams,
    pushItems?: SyncPushItem[]
  ): Promise<ApiResponse<{ pull: SyncPullResponse; push?: SyncPushResponse }>> => {
    const pullResult = await sync.pull(params);

    let pushResult: SyncPushResponse | undefined;
    if (pushItems && pushItems.length > 0) {
      const pushResponse = await sync.push(pushItems);
      pushResult = pushResponse.data;
    }

    return {
      data: {
        pull: pullResult.data,
        push: pushResult,
      },
    };
  },

  /**
   * Clear sync queue on server
   * Removes all pending sync operations for the current user
   */
  clearQueue: async (): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete<ApiResponse<{ success: boolean }>>('/sync/queue');
  },
};
