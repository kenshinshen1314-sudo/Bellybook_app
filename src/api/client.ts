/**
 * API Client
 *
 * Base HTTP client with interceptors, token management, and error handling
 */

import type {
  ApiResponse,
  ApiError,
  TokenPair,
} from './types';

// API base URL - configure for your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Token storage keys
 */
const TOKEN_KEYS = {
  ACCESS: 'bb_access_token',
  REFRESH: 'bb_refresh_token',
  EXPIRES_AT: 'bb_token_expires_at',
} as const;

/**
 * Token Manager - handles JWT token storage and refresh
 */
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;

  /**
   * Load tokens from localStorage
   */
  loadTokens(): void {
    this.accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS);
    this.refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
    const expiresAt = localStorage.getItem(TOKEN_KEYS.EXPIRES_AT);
    this.expiresAt = expiresAt ? parseInt(expiresAt, 10) : null;
  }

  /**
   * Save tokens to localStorage
   */
  saveTokens(tokenPair: TokenPair): void {
    this.accessToken = tokenPair.accessToken;
    this.refreshToken = tokenPair.refreshToken;
    this.expiresAt = Date.now() + tokenPair.expiresIn * 1000;

    localStorage.setItem(TOKEN_KEYS.ACCESS, tokenPair.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH, tokenPair.refreshToken);
    localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, this.expiresAt.toString());
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Check if access token is expired or about to expire (within 1 minute)
   */
  isTokenExpired(): boolean {
    if (!this.expiresAt) return true;
    // Add 1 minute buffer
    return Date.now() >= this.expiresAt - 60000;
  }

  /**
   * Clear all tokens (logout)
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;

    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem(TOKEN_KEYS.EXPIRES_AT);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }
}

/**
 * Global token manager instance
 */
const tokenManager = new TokenManager();
tokenManager.loadTokens();

/**
 * API Error class
 */
export class ApiRequestError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Request options
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

/**
 * Build URL with query parameters
 */
function buildUrl(base: string, path: string, params?: Record<string, string | number>): string {
  // Ensure proper path joining: remove trailing slash from base and leading slash from path
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const fullPath = cleanBase + cleanPath;
  
  const url = new URL(fullPath);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    tokenManager.clearTokens();
    throw new ApiRequestError('Failed to refresh token', response.status);
  }

  const data: ApiResponse<TokenPair> = await response.json();
  tokenManager.saveTokens(data.data);
  return data.data.accessToken;
}

/**
 * Request interceptors - modify request before sending
 */
const requestInterceptors: Array<(request: Request) => Request | Promise<Request>> = [];

/**
 * Response interceptors - modify response after receiving
 */
const responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

/**
 * Add request interceptor
 */
export function addRequestInterceptor(
  interceptor: (request: Request) => Request | Promise<Request>
): () => void {
  requestInterceptors.push(interceptor);
  return () => {
    const index = requestInterceptors.indexOf(interceptor);
    if (index > -1) requestInterceptors.splice(index, 1);
  };
}

/**
 * Add response interceptor
 */
export function addResponseInterceptor(
  interceptor: (response: Response) => Response | Promise<Response>
): () => void {
  responseInterceptors.push(interceptor);
  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index > -1) responseInterceptors.splice(index, 1);
  };
}

/**
 * Core fetch function with token management and retry
 */
async function fetchWithAuth<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  try {
    const {
      params,
      skipAuth = false,
      skipRefresh = false,
      headers = {},
      ...fetchOptions
    } = options;

    let url = buildUrl(API_BASE_URL, path, params);

    // Prepare headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if needed
    if (!skipAuth && tokenManager.isAuthenticated()) {
      requestHeaders['Authorization'] = `Bearer ${tokenManager.getAccessToken()}`;
    }

    let request = new Request(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    // Apply request interceptors
    for (const interceptor of requestInterceptors) {
      request = await interceptor(request);
    }

    let response = await fetch(request);

    // Apply response interceptors
    for (const interceptor of responseInterceptors) {
      response = await interceptor(response);
    }

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && !skipAuth && !skipRefresh && tokenManager.getRefreshToken()) {
      try {
        const newToken = await refreshAccessToken();
        // Update request with new token
        requestHeaders['Authorization'] = `Bearer ${newToken}`;
        request = new Request(url, {
          ...fetchOptions,
          headers: requestHeaders,
        });
        response = await fetch(request);
      } catch (error) {
        // Token refresh failed, clear tokens
        tokenManager.clearTokens();
        throw new ApiRequestError('Authentication failed', 401);
      }
    }

    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'Request failed';
      let errorCode: string | undefined;
      let details: any;

      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code;
        details = errorData.details;
      } catch {
        // Use default error message
      }

      throw new ApiRequestError(errorMessage, response.status, errorCode, details);
    }

    return response.json();
  } catch (error) {
    // Handle network errors and other exceptions
    if (error instanceof ApiRequestError) {
      throw error;
    }

    // Network error or other fetch-related error
    if (error instanceof Error) {
      throw new ApiRequestError(
        error.message || 'Network error',
        0,
        'NETWORK_ERROR',
        { originalError: error }
      );
    }

    // Unknown error
    throw new ApiRequestError(
      'An unexpected error occurred',
      0,
      'UNKNOWN'
    );
  }
}

/**
 * API Client object
 */
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => fetchWithAuth<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, data?: any, options?: RequestOptions) =>
    fetchWithAuth<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(path: string, data?: any, options?: RequestOptions) =>
    fetchWithAuth<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: <T>(path: string, data?: any, options?: RequestOptions) =>
    fetchWithAuth<T>(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: <T>(path: string, options?: RequestOptions) => fetchWithAuth<T>(path, { ...options, method: 'DELETE' }),
};

/**
 * Export token manager for external access
 */
export { tokenManager };

/**
 * Export API base URL
 */
export { API_BASE_URL };
