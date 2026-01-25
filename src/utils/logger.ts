/**
 * Unified Logger Utility
 * 统一日志工具
 *
 * Provides consistent logging throughout the application with
 * environment-aware output and optional log levels.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableInProduction: boolean;
}

// Default configuration
const config: LoggerConfig = {
  level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info',
  enableInProduction: import.meta.env.MODE !== 'production'
};

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  if (import.meta.env.DEV) return true;
  if (!config.enableInProduction) return false;

  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(config.level);
  const messageLevelIndex = levels.indexOf(level);

  return messageLevelIndex >= currentLevelIndex;
}

/**
 * Format log message with timestamp and level
 */
function format(level: LogLevel, ...args: unknown[]): string[] {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return [prefix, ...args];
}

/**
 * Logger object with level-based methods
 */
export const logger = {
  /**
   * Debug level logs - only shown in development
   */
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.log(...format('debug', ...args));
    }
  },

  /**
   * Info level logs - shown in development and production (if enabled)
   */
  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      console.log(...format('info', ...args));
    }
  },

  /**
   * Warning level logs - always shown
   */
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(...format('warn', ...args));
    }
  },

  /**
   * Error level logs - always shown
   */
  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(...format('error', ...args));
    }
  },

  /**
   * Configure logger settings
   */
  configure: (newConfig: Partial<LoggerConfig>) => {
    Object.assign(config, newConfig);
  }
};

/**
 * Convenience functions for specific modules
 */
export const createModuleLogger = (moduleName: string) => ({
  debug: (...args: unknown[]) => logger.debug(`[${moduleName}]`, ...args),
  info: (...args: unknown[]) => logger.info(`[${moduleName}]`, ...args),
  warn: (...args: unknown[]) => logger.warn(`[${moduleName}]`, ...args),
  error: (...args: unknown[]) => logger.error(`[${moduleName}]`, ...args),
});

export default logger;
