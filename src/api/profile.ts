/**
 * Profile and Settings API
 *
 * API endpoints for user profile and settings management
 */

import { apiClient, tokenManager } from './client';
import type {
  ApiResponse,
  TokenPair,
  LoginCredentials,
  UpdateProfileDto,
  UpdateSettingsDto,
} from './types';

/**
 * Authentication endpoints
 */
export const auth = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<TokenPair>> => {
    const response = await apiClient.post<ApiResponse<TokenPair>>('/auth/login', credentials, {
      skipAuth: true,
    });

    // Save tokens on successful login
    if (response.data) {
      tokenManager.saveTokens(response.data);
    }

    return response;
  },

  /**
   * Register a new user
   */
  register: async (data: {
    email: string;
    password: string;
    displayName?: string;
  }): Promise<ApiResponse<TokenPair>> => {
    const response = await apiClient.post<ApiResponse<TokenPair>>('/auth/register', data, {
      skipAuth: true,
    });

    // Save tokens on successful registration
    if (response.data) {
      tokenManager.saveTokens(response.data);
    }

    return response;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>('/auth/logout');

    // Clear local tokens
    tokenManager.clearTokens();

    return response;
  },

  /**
   * Refresh access token
   * (Handled automatically by api client, but can be called manually if needed)
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<TokenPair>> => {
    const response = await apiClient.post<ApiResponse<TokenPair>>('/auth/refresh', { refreshToken }, {
      skipAuth: true,
    });

    if (response.data) {
      tokenManager.saveTokens(response.data);
    }

    return response;
  },

  /**
   * Verify email with code
   */
  verifyEmail: async (code: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<ApiResponse<{ success: boolean }>>('/auth/verify-email', { code });
  },

  /**
   * Request password reset email
   */
  requestPasswordReset: async (email: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<ApiResponse<{ success: boolean }>>('/auth/request-reset', { email }, {
      skipAuth: true,
    });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post<ApiResponse<{ success: boolean }>>('/auth/reset-password', {
      token,
      newPassword,
    }, { skipAuth: true });
  },
};

/**
 * Profile endpoints
 */
export const profile = {
  /**
   * Get current user profile
   */
  get: async (): Promise<ApiResponse<{ profile: any; settings: any }>> => {
    return apiClient.get<ApiResponse<any>>('/profile');
  },

  /**
   * Update user profile
   */
  update: async (data: UpdateProfileDto): Promise<ApiResponse<any>> => {
    return apiClient.patch<ApiResponse<any>>('/profile', data);
  },

  /**
   * Update user settings
   */
  updateSettings: async (data: UpdateSettingsDto): Promise<ApiResponse<any>> => {
    return apiClient.patch<ApiResponse<any>>('/profile/settings', data);
  },

  /**
   * Upload avatar image
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = tokenManager.getAccessToken();
    const response = await fetch('/api/v1/profile/avatar', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload avatar: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete user account
   */
  deleteAccount: async (): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete<ApiResponse<{ success: boolean }>>('/profile');
  },
};
