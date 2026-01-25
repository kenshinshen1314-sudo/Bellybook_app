/**
 * Performance and Retry Utilities for API Client
 */

import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('APIPerformance');

// ============================================================================
// Retry Configuration
// ============================================================================

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'ECONNRESET'],
};

// ============================================================================
// Retry Logic
// ============================================================================

/**
 * Check if a request should be retried
 */
export function shouldRetry(
  error: any,
  attempt: number,
  config: RetryConfig
): boolean {
  // Max retries reached
  if (attempt >= config.maxRetries) {
    return false;
  }

  // Check status code
  if (error.status && config.retryableStatuses.includes(error.status)) {
    return true;
  }

  // Check error code
  if (error.code && config.retryableErrors.includes(error.code)) {
    return true;
  }

  // Network errors (no response)
  if (!error.response && error.name === 'ApiRequestError') {
    return true;
  }

  return false;
}

/**
 * Calculate delay with exponential backoff
 */
export function calculateRetryDelay(attempt: number, baseDelay: number): number {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // Add 0-30% jitter
  return exponentialDelay + jitter;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error, attempt, config)) {
        throw error;
      }

      const delay = calculateRetryDelay(attempt, config.retryDelay);
      logger.debug(`Retrying request (attempt ${attempt + 1}/${config.maxRetries}) after ${delay.toFixed(0)}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

// ============================================================================
// Request Caching
// ============================================================================

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL = 60000; // 1 minute

  /**
   * Generate cache key from URL and options
   */
  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body;
    return `${method}:${url}:${body || ''}`;
  }

  /**
   * Get cached response
   */
  get(url: string, options?: RequestInit): any | null {
    const key = this.generateKey(url, options);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached response
   */
  set(url: string, data: any, options?: RequestInit, ttl?: number): void {
    const key = this.generateKey(url, options);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const requestCache = new RequestCache();

// Clear expired cache entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestCache.clearExpired();
  }, 300000);
}

// ============================================================================
// Request Batching
// ============================================================================

interface BatchedRequest {
  key: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestBatcher {
  private pending: Map<string, BatchedRequest[]> = new Map();
  private delay = 50; // ms to wait for more requests

  /**
   * Batch requests with the same key
   */
  async batch<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requests = this.pending.get(key) || [];

      // Add this request to the batch
      requests.push({ key, resolve, reject });
      this.pending.set(key, requests);

      // Execute after delay
      setTimeout(() => {
        this.executeBatch(key, fn);
      }, this.delay);
    });
  }

  /**
   * Execute a batch of requests
   */
  private async executeBatch<T>(key: string, fn: () => Promise<T>): Promise<void> {
    const requests = this.pending.get(key);
    if (!requests || requests.length === 0) {
      return;
    }

    // Remove from pending
    this.pending.delete(key);

    try {
      // Execute once for all requests
      const result = await fn();

      // Resolve all requests with the same result
      for (const request of requests) {
        request.resolve(result);
      }
    } catch (error) {
      // Reject all requests
      for (const request of requests) {
        request.reject(error);
      }
    }
  }
}

// Global batcher instance
export const requestBatcher = new RequestBatcher();

// ============================================================================
// Request Performance Monitoring
// ============================================================================

interface PerformanceMetrics {
  url: string;
  method: string;
  duration: number;
  success: boolean;
  status?: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;

  /**
   * Record a request
   */
  record(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get average request duration
   */
  getAverageDuration(): number {
    if (this.metrics.length === 0) return 0;

    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.length;
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (this.metrics.length === 0) return 0;

    const successful = this.metrics.filter(m => m.success).length;
    return (successful / this.metrics.length) * 100;
  }

  /**
   * Get slowest requests
   */
  getSlowestRequests(count = 5): PerformanceMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, count);
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get all metrics
   */
  getAll(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Global monitor instance
export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// Request Timeout
// ============================================================================

/**
 * Create a timeout promise
 */
export function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${ms}ms`));
    }, ms);
  });
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit & { timeout?: number }
): Promise<Response> {
  const timeout = init?.timeout || 30000; // Default 30 seconds

  try {
    return await Promise.race([
      fetch(input, init),
      createTimeoutPromise(timeout),
    ]) as Response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(
  fn: () => Promise<T>,
  url: string,
  method: string
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    performanceMonitor.record({
      url,
      method,
      duration,
      success: true,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    performanceMonitor.record({
      url,
      method,
      duration,
      success: false,
      status: (error as any).status,
      timestamp: Date.now(),
    });

    throw error;
  }
}

/**
 * Get performance stats (for debugging)
 */
export function getPerformanceStats() {
  return {
    averageDuration: performanceMonitor.getAverageDuration(),
    successRate: performanceMonitor.getSuccessRate(),
    slowestRequests: performanceMonitor.getSlowestRequests(),
    cacheSize: requestCache.size(),
  };
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).apiPerformance = {
    getStats: getPerformanceStats,
    clearCache: () => requestCache.clear(),
    getMetrics: () => performanceMonitor.getAll(),
  };
}
