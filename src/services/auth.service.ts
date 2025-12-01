import { OperationResult, createSuccessResult, createErrorResult, ErrorCodes } from '@/types/api';
import { User, LoginRequest, LoginResponse, RegisterRequest, RefreshTokenRequest } from '@/types';
import { apiPost, setTokens, clearTokens, isMockMode } from './api-client';
import { mockUsers, mockCurrentUser } from './mock-data';

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

function mockLogin(request: LoginRequest): OperationResult<LoginResponse> {
  const user = mockUsers.find(u => u.email === request.email);

  if (!user) {
    return createErrorResult(
      ErrorCodes.INVALID_CREDENTIALS,
      'Invalid email or password',
      401
    );
  }

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
  const existingUser = mockUsers.find(u => u.email === request.email);

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

  return createSuccessResult(newUser, 201);
}

function mockGetCurrentUser(): OperationResult<User> {
  return createSuccessResult(mockCurrentUser);
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

    const response: LoginResponse = {
      user: mockCurrentUser,
      accessToken: `mock-access-token-refreshed-${Date.now()}`,
      refreshToken: `mock-refresh-token-refreshed-${Date.now()}`,
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

    const user = mockUsers.find(u => u.email === email);
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
