import { OperationResult, createSuccessResult, createErrorResult, ErrorCodes } from '@/types/api';
import { User, LoginRequest, LoginResponse, RegisterRequest, RefreshTokenRequest } from '@/types';
import { apiPost, setTokens, clearTokens, isMockMode, getAccessToken } from './api-client';
import { mockStore } from './mock-store';

// ============================================
// Auth API Service
// ============================================

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
} as const;

// ============================================
// Mock Handlers
// ============================================

// Track current logged-in user ID from token
let currentLoggedInUserId: string | null = null;

function mockLogin(request: LoginRequest): OperationResult<LoginResponse> {
  const user = mockStore.users.find(u => u.email === request.email);

  if (!user) {
    return createErrorResult(
      ErrorCodes.INVALID_CREDENTIALS,
      'Invalid email or password',
      401
    );
  }

  // Track current user
  currentLoggedInUserId = user.id;

  // In mock mode, accept any password
  const response: LoginResponse = {
    user,
    accessToken: `mock-access-token-${user.id}-${Date.now()}`,
    refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };

  return createSuccessResult(response);
}

function mockRegister(request: RegisterRequest): OperationResult<User> {
  const existingUser = mockStore.users.find(u => u.email === request.email);

  if (existingUser) {
    return createErrorResult(
      ErrorCodes.EMAIL_ALREADY_EXISTS,
      'A user with this email already exists',
      409
    );
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: request.email,
    firstName: request.firstName,
    lastName: request.lastName,
    isEmailVerified: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockStore.users.push(newUser);
  return createSuccessResult(newUser, 201);
}

function mockGetCurrentUser(): OperationResult<User> {
  // Try to get user ID from token
  const token = getAccessToken();
  if (token) {
    // Extract user ID from mock token format: mock-access-token-{userId}-{timestamp}
    const parts = token.split('-');
    if (parts.length >= 4) {
      const userId = `${parts[3]}-${parts[4]}`; // user-1 format
      const user = mockStore.users.find(u => u.id === userId);
      if (user) {
        return createSuccessResult(user);
      }
    }
  }

  // Fallback to tracked user or first user
  if (currentLoggedInUserId) {
    const user = mockStore.users.find(u => u.id === currentLoggedInUserId);
    if (user) {
      return createSuccessResult(user);
    }
  }

  // Default to first user
  const defaultUser = mockStore.users[0];
  if (defaultUser) {
    return createSuccessResult(defaultUser);
  }

  return createErrorResult(ErrorCodes.UNAUTHORIZED, 'Not authenticated', 401);
}

// ============================================
// Auth Service Functions
// ============================================

export async function login(request: LoginRequest): Promise<OperationResult<LoginResponse>> {
  if (isMockMode()) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const result = mockLogin(request);

    if (result.isSuccess && result.data) {
      setTokens(result.data.accessToken, result.data.refreshToken);
    }

    return result;
  }

  const result = await apiPost<LoginResponse, LoginRequest>(AUTH_ENDPOINTS.LOGIN, request);

  if (result.isSuccess && result.data) {
    setTokens(result.data.accessToken, result.data.refreshToken);
  }

  return result;
}

export async function register(request: RegisterRequest): Promise<OperationResult<User>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRegister(request);
  }

  return apiPost<User, RegisterRequest>(AUTH_ENDPOINTS.REGISTER, request);
}

export async function logout(): Promise<OperationResult<null>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 100));
    clearTokens();
    return createSuccessResult(null);
  }

  const result = await apiPost<null>(AUTH_ENDPOINTS.LOGOUT);
  clearTokens();
  return result;
}

export async function refreshToken(request: RefreshTokenRequest): Promise<OperationResult<LoginResponse>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));

    // Get current user from token or fallback
    const userResult = mockGetCurrentUser();
    const user = userResult.isSuccess && userResult.data ? userResult.data : mockStore.users[0];

    const response: LoginResponse = {
      user,
      accessToken: `mock-access-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    setTokens(response.accessToken, response.refreshToken);
    return createSuccessResult(response);
  }

  const result = await apiPost<LoginResponse, RefreshTokenRequest>(AUTH_ENDPOINTS.REFRESH, request);

  if (result.isSuccess && result.data) {
    setTokens(result.data.accessToken, result.data.refreshToken);
  }

  return result;
}

export async function getCurrentUser(): Promise<OperationResult<User>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGetCurrentUser();
  }

  return apiPost<User>(AUTH_ENDPOINTS.ME);
}

export async function forgotPassword(email: string): Promise<OperationResult<null>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = mockStore.users.find(u => u.email === email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return createSuccessResult(null);
    }

    return createSuccessResult(null);
  }

  return apiPost<null, { email: string }>(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<OperationResult<null>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return createSuccessResult(null);
  }

  return apiPost<null, { token: string; newPassword: string }>(AUTH_ENDPOINTS.RESET_PASSWORD, {
    token,
    newPassword,
  });
}

export async function verifyEmail(token: string): Promise<OperationResult<null>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return createSuccessResult(null);
  }

  return apiPost<null, { token: string }>(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
}
