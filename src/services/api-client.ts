import { OperationResult, createErrorResult, ErrorCodes } from '@/types/api';

// ============================================
// API Client Configuration
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'; // Default to true for development

// Simulated network delay for mock requests (ms)
const MOCK_DELAY_MIN = 200;
const MOCK_DELAY_MAX = 500;

// ============================================
// Token Management
// ============================================

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (!refreshToken) {
    refreshToken = localStorage.getItem('refreshToken');
  }
  return refreshToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ============================================
// Helper Functions
// ============================================

function simulateDelay(): Promise<void> {
  const delay = Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN) + MOCK_DELAY_MIN;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// ============================================
// API Client
// ============================================

export interface ApiClientOptions {
  useMock?: boolean;
  mockHandler?: <T>() => Promise<OperationResult<T>>;
}

async function handleResponse<T>(response: Response): Promise<OperationResult<T>> {
  try {
    const data = await response.json();
    return data as OperationResult<T>;
  } catch {
    return createErrorResult<T>(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to parse server response',
      response.status
    );
  }
}

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: ApiClientOptions
): Promise<OperationResult<T>> {
  // Use mock handler if provided and mock mode is enabled
  if ((options?.useMock ?? USE_MOCK_DATA) && options?.mockHandler) {
    await simulateDelay();
    return options.mockHandler<T>();
  }

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error('API GET Error:', error);
    return createErrorResult<T>(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Network error occurred',
      500
    );
  }
}

export async function apiPost<T, B = unknown>(
  endpoint: string,
  body?: B,
  options?: ApiClientOptions
): Promise<OperationResult<T>> {
  // Use mock handler if provided and mock mode is enabled
  if ((options?.useMock ?? USE_MOCK_DATA) && options?.mockHandler) {
    await simulateDelay();
    return options.mockHandler<T>();
  }

  try {
    const response = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error('API POST Error:', error);
    return createErrorResult<T>(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Network error occurred',
      500
    );
  }
}

export async function apiPut<T, B = unknown>(
  endpoint: string,
  body?: B,
  options?: ApiClientOptions
): Promise<OperationResult<T>> {
  // Use mock handler if provided and mock mode is enabled
  if ((options?.useMock ?? USE_MOCK_DATA) && options?.mockHandler) {
    await simulateDelay();
    return options.mockHandler<T>();
  }

  try {
    const response = await fetch(buildUrl(endpoint), {
      method: 'PUT',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error('API PUT Error:', error);
    return createErrorResult<T>(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Network error occurred',
      500
    );
  }
}

export async function apiPatch<T, B = unknown>(
  endpoint: string,
  body?: B,
  options?: ApiClientOptions
): Promise<OperationResult<T>> {
  // Use mock handler if provided and mock mode is enabled
  if ((options?.useMock ?? USE_MOCK_DATA) && options?.mockHandler) {
    await simulateDelay();
    return options.mockHandler<T>();
  }

  try {
    const response = await fetch(buildUrl(endpoint), {
      method: 'PATCH',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error('API PATCH Error:', error);
    return createErrorResult<T>(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Network error occurred',
      500
    );
  }
}

export async function apiDelete<T>(
  endpoint: string,
  options?: ApiClientOptions
): Promise<OperationResult<T>> {
  // Use mock handler if provided and mock mode is enabled
  if ((options?.useMock ?? USE_MOCK_DATA) && options?.mockHandler) {
    await simulateDelay();
    return options.mockHandler<T>();
  }

  try {
    const response = await fetch(buildUrl(endpoint), {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return handleResponse<T>(response);
  } catch (error) {
    console.error('API DELETE Error:', error);
    return createErrorResult<T>(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Network error occurred',
      500
    );
  }
}

// ============================================
// Export Configuration Check
// ============================================

export function isMockMode(): boolean {
  return USE_MOCK_DATA;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
