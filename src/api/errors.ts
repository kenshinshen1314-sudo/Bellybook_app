/**
 * Authentication Error Types
 */

/**
 * Base authentication error
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Network error - connection issues
 */
export class NetworkError extends AuthError {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Validation error - invalid input
 */
export class ValidationError extends AuthError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error - invalid credentials
 */
export class InvalidCredentialsError extends AuthError {
  constructor(message: string = 'Invalid username or password') {
    super(message, 'INVALID_CREDENTIALS', 401);
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Conflict error - user already exists
 */
export class UserExistsError extends AuthError {
  constructor(field: 'username' | 'email' = 'username') {
    super(
      field === 'username'
        ? 'Username already exists'
        : 'Email already exists',
      'USER_EXISTS',
      409
    );
    this.name = 'UserExistsError';
    this.field = field;
  }

  field: 'username' | 'email';
}

/**
 * Unauthorized error - not authenticated
 */
export class UnauthorizedError extends AuthError {
  constructor(message: string = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Token expired error
 */
export class TokenExpiredError extends AuthError {
  constructor(message: string = 'Session expired. Please login again.') {
    super(message, 'TOKEN_EXPIRED', 401);
    this.name = 'TokenExpiredError';
  }
}

/**
 * Parse API error and convert to appropriate AuthError
 */
export function parseAuthError(error: any): AuthError {
  // Already an AuthError
  if (error instanceof AuthError) {
    return error;
  }

  // ApiRequestError from apiClient
  if (error instanceof Error && error.name === 'ApiRequestError') {
    const apiError = error as any;
    const message = apiError.message || 'An error occurred';
    const statusCode = apiError.status;
    const code = apiError.code;

    // Handle network errors
    if (code === 'NETWORK_ERROR' || statusCode === 0) {
      return new NetworkError(message);
    }

    switch (statusCode) {
      case 400:
        return new ValidationError(message);
      case 401:
        if (code === 'TOKEN_EXPIRED' || message.includes('expired')) {
          return new TokenExpiredError();
        }
        return new InvalidCredentialsError(message);
      case 409:
        if (message.includes('username') || code === 'USERNAME_EXISTS') {
          return new UserExistsError('username');
        }
        if (message.includes('email') || code === 'EMAIL_EXISTS') {
          return new UserExistsError('email');
        }
        return new AuthError(message, code || 'CONFLICT', statusCode);
      default:
        return new AuthError(message, code || 'UNKNOWN', statusCode);
    }
  }

  // Standard Error object (e.g., from fetch failure)
  if (error instanceof Error) {
    return new NetworkError(error.message || 'Network error. Please check your connection.');
  }

  // Unknown error
  return new AuthError(
    'An unexpected error occurred',
    'UNKNOWN'
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: AuthError): string {
  // Error messages are already user-friendly in the error classes
  return error.message;
}

/**
 * Get error field for form validation
 */
export function getErrorField(error: AuthError): string | undefined {
  if (error instanceof ValidationError) {
    return error.field;
  }
  if (error instanceof UserExistsError) {
    return error.field;
  }
  return undefined;
}
