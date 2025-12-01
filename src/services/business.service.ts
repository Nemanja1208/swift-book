import { OperationResult, createSuccessResult, createErrorResult, createNotFoundResult, ErrorCodes } from '@/types/api';
import { Business, CreateBusinessRequest, UpdateBusinessRequest, PaginatedResult, PaginationParams } from '@/types';
import { apiGet, apiPost, apiPut, apiDelete, isMockMode } from './api-client';
import { mockBusinesses, mockCurrentBusiness } from './mock-data';

// ============================================
// Business API Service
// ============================================

const BUSINESS_ENDPOINTS = {
  BASE: '/businesses',
  BY_ID: (id: string) => `/businesses/${id}`,
  BY_SLUG: (slug: string) => `/businesses/slug/${slug}`,
  MY_BUSINESSES: '/businesses/my',
} as const;

// Local mock data store (for mutations during session)
let localMockBusinesses = [...mockBusinesses];

// ============================================
// Mock Handlers
// ============================================

function mockGetAllBusinesses(params?: PaginationParams): OperationResult<PaginatedResult<Business>> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const items = localMockBusinesses.slice(startIndex, endIndex);

  return createSuccessResult({
    items,
    totalCount: localMockBusinesses.length,
    page,
    pageSize,
    totalPages: Math.ceil(localMockBusinesses.length / pageSize),
    hasNextPage: endIndex < localMockBusinesses.length,
    hasPreviousPage: page > 1,
  });
}

function mockGetBusinessById(id: string): OperationResult<Business> {
  const business = localMockBusinesses.find(b => b.id === id);

  if (!business) {
    return createNotFoundResult('Business');
  }

  return createSuccessResult(business);
}

function mockGetBusinessBySlug(slug: string): OperationResult<Business> {
  const business = localMockBusinesses.find(b => b.slug === slug);

  if (!business) {
    return createNotFoundResult('Business');
  }

  return createSuccessResult(business);
}

function mockGetMyBusinesses(): OperationResult<Business[]> {
  // In mock mode, return all businesses as "owned" by current user
  return createSuccessResult(localMockBusinesses);
}

function mockCreateBusiness(request: CreateBusinessRequest): OperationResult<Business> {
  const slug = request.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const existingSlug = localMockBusinesses.find(b => b.slug === slug);
  if (existingSlug) {
    return createErrorResult(
      ErrorCodes.BUSINESS_SLUG_EXISTS,
      'A business with this name already exists',
      409
    );
  }

  const newBusiness: Business = {
    id: `business-${Date.now()}`,
    ownerId: 'user-1', // Mock current user
    name: request.name,
    type: request.type,
    description: request.description,
    country: request.country,
    timezone: request.timezone,
    address: request.address,
    isActive: true,
    slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  localMockBusinesses.push(newBusiness);
  return createSuccessResult(newBusiness, 201);
}

function mockUpdateBusiness(id: string, request: UpdateBusinessRequest): OperationResult<Business> {
  const index = localMockBusinesses.findIndex(b => b.id === id);

  if (index === -1) {
    return createNotFoundResult('Business');
  }

  const updatedBusiness: Business = {
    ...localMockBusinesses[index],
    ...request,
    updatedAt: new Date().toISOString(),
  };

  localMockBusinesses[index] = updatedBusiness;
  return createSuccessResult(updatedBusiness);
}

function mockDeleteBusiness(id: string): OperationResult<null> {
  const index = localMockBusinesses.findIndex(b => b.id === id);

  if (index === -1) {
    return createNotFoundResult('Business');
  }

  localMockBusinesses.splice(index, 1);
  return createSuccessResult(null);
}

// ============================================
// Business Service Functions
// ============================================

export async function getAllBusinesses(
  params?: PaginationParams
): Promise<OperationResult<PaginatedResult<Business>>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockGetAllBusinesses(params);
  }

  return apiGet<PaginatedResult<Business>>(BUSINESS_ENDPOINTS.BASE, params as Record<string, string | number>);
}

export async function getBusinessById(id: string): Promise<OperationResult<Business>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGetBusinessById(id);
  }

  return apiGet<Business>(BUSINESS_ENDPOINTS.BY_ID(id));
}

export async function getBusinessBySlug(slug: string): Promise<OperationResult<Business>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGetBusinessBySlug(slug);
  }

  return apiGet<Business>(BUSINESS_ENDPOINTS.BY_SLUG(slug));
}

export async function getMyBusinesses(): Promise<OperationResult<Business[]>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return mockGetMyBusinesses();
  }

  return apiGet<Business[]>(BUSINESS_ENDPOINTS.MY_BUSINESSES);
}

export async function getCurrentBusiness(): Promise<OperationResult<Business>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return createSuccessResult(mockCurrentBusiness);
  }

  // In real implementation, this would get the current active business from context/session
  return apiGet<Business>(BUSINESS_ENDPOINTS.MY_BUSINESSES);
}

export async function createBusiness(
  request: CreateBusinessRequest
): Promise<OperationResult<Business>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCreateBusiness(request);
  }

  return apiPost<Business, CreateBusinessRequest>(BUSINESS_ENDPOINTS.BASE, request);
}

export async function updateBusiness(
  id: string,
  request: UpdateBusinessRequest
): Promise<OperationResult<Business>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUpdateBusiness(id, request);
  }

  return apiPut<Business, UpdateBusinessRequest>(BUSINESS_ENDPOINTS.BY_ID(id), request);
}

export async function deleteBusiness(id: string): Promise<OperationResult<null>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDeleteBusiness(id);
  }

  return apiDelete<null>(BUSINESS_ENDPOINTS.BY_ID(id));
}
