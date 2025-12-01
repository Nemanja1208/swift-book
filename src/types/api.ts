// ============================================
// Operation Result - .NET Clean Architecture API Response Wrapper
// ============================================

/**
 * Mirrors the .NET OperationResult<T> pattern
 * Used as the standard response wrapper for all API endpoints
 */
export interface OperationResult<T = null> {
  isSuccess: boolean;
  data: T | null;
  error: ApiError | null;
  validationErrors: ValidationError[];
  statusCode: number;
}

/**
 * API Error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: string;
  stackTrace?: string; // Only in development
}

/**
 * Validation error for field-level errors
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ============================================
// Common Error Codes (match .NET ErrorCodes)
// ============================================

export const ErrorCodes = {
  // General
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',

  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_PASSWORD: 'INVALID_PASSWORD',

  // Business
  BUSINESS_NOT_FOUND: 'BUSINESS_NOT_FOUND',
  BUSINESS_SLUG_EXISTS: 'BUSINESS_SLUG_EXISTS',
  NOT_BUSINESS_OWNER: 'NOT_BUSINESS_OWNER',

  // Staff
  STAFF_NOT_FOUND: 'STAFF_NOT_FOUND',
  STAFF_ALREADY_EXISTS: 'STAFF_ALREADY_EXISTS',
  CANNOT_REMOVE_OWNER: 'CANNOT_REMOVE_OWNER',

  // Service
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  SERVICE_CATEGORY_NOT_FOUND: 'SERVICE_CATEGORY_NOT_FOUND',

  // Booking
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  SLOT_NOT_AVAILABLE: 'SLOT_NOT_AVAILABLE',
  BOOKING_ALREADY_CANCELLED: 'BOOKING_ALREADY_CANCELLED',
  CANNOT_CANCEL_PAST_BOOKING: 'CANNOT_CANCEL_PAST_BOOKING',
  INVALID_BOOKING_TIME: 'INVALID_BOOKING_TIME',

  // Customer
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',
  CUSTOMER_EMAIL_EXISTS: 'CUSTOMER_EMAIL_EXISTS',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ============================================
// Helper Functions for Creating Results
// ============================================

export function createSuccessResult<T>(data: T, statusCode = 200): OperationResult<T> {
  return {
    isSuccess: true,
    data,
    error: null,
    validationErrors: [],
    statusCode,
  };
}

export function createErrorResult<T = null>(
  code: string,
  message: string,
  statusCode = 400,
  details?: string
): OperationResult<T> {
  return {
    isSuccess: false,
    data: null,
    error: {
      code,
      message,
      details,
    },
    validationErrors: [],
    statusCode,
  };
}

export function createValidationErrorResult<T = null>(
  errors: ValidationError[]
): OperationResult<T> {
  return {
    isSuccess: false,
    data: null,
    error: {
      code: ErrorCodes.VALIDATION_FAILED,
      message: 'One or more validation errors occurred.',
    },
    validationErrors: errors,
    statusCode: 400,
  };
}

export function createNotFoundResult<T = null>(
  resource: string
): OperationResult<T> {
  return {
    isSuccess: false,
    data: null,
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: `${resource} not found.`,
    },
    validationErrors: [],
    statusCode: 404,
  };
}

export function createUnauthorizedResult<T = null>(
  message = 'Unauthorized'
): OperationResult<T> {
  return {
    isSuccess: false,
    data: null,
    error: {
      code: ErrorCodes.UNAUTHORIZED,
      message,
    },
    validationErrors: [],
    statusCode: 401,
  };
}

// ============================================
// Type Guards
// ============================================

export function isSuccessResult<T>(
  result: OperationResult<T>
): result is OperationResult<T> & { data: T; isSuccess: true } {
  return result.isSuccess && result.data !== null;
}

export function isErrorResult<T>(
  result: OperationResult<T>
): result is OperationResult<T> & { error: ApiError; isSuccess: false } {
  return !result.isSuccess && result.error !== null;
}

export function hasValidationErrors<T>(
  result: OperationResult<T>
): boolean {
  return result.validationErrors.length > 0;
}
