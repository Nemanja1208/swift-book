import { OperationResult, createSuccessResult, createNotFoundResult } from '@/types/api';
import {
  Service,
  ServiceCategory,
  CreateServiceRequest,
  UpdateServiceRequest,
  PaginatedResult,
  PaginationParams,
} from '@/types';
import { apiGet, apiPost, apiPut, apiDelete, isMockMode } from './api-client';
import { mockStore } from './mock-store';

// ============================================
// Service API Service
// ============================================

const SERVICE_ENDPOINTS = {
  BASE: (businessId: string) => `/businesses/${businessId}/services`,
  BY_ID: (businessId: string, serviceId: string) => `/businesses/${businessId}/services/${serviceId}`,
  CATEGORIES: (businessId: string) => `/businesses/${businessId}/service-categories`,
  CATEGORY_BY_ID: (businessId: string, categoryId: string) =>
    `/businesses/${businessId}/service-categories/${categoryId}`,
} as const;

// ============================================
// Mock Handlers
// ============================================

function mockGetAllServices(
  businessId: string,
  params?: PaginationParams & { categoryId?: string }
): OperationResult<PaginatedResult<Service>> {
  let servicesForBusiness = mockStore.services.filter(s => s.businessId === businessId);

  if (params?.categoryId) {
    servicesForBusiness = servicesForBusiness.filter(s => s.categoryId === params.categoryId);
  }

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const items = servicesForBusiness.slice(startIndex, endIndex);

  return createSuccessResult({
    items,
    totalCount: servicesForBusiness.length,
    page,
    pageSize,
    totalPages: Math.ceil(servicesForBusiness.length / pageSize),
    hasNextPage: endIndex < servicesForBusiness.length,
    hasPreviousPage: page > 1,
  });
}

function mockGetServiceById(businessId: string, serviceId: string): OperationResult<Service> {
  const service = mockStore.services.find(s => s.id === serviceId && s.businessId === businessId);

  if (!service) {
    return createNotFoundResult('Service');
  }

  return createSuccessResult(service);
}

function mockCreateService(businessId: string, request: CreateServiceRequest): OperationResult<Service> {
  const newService: Service = {
    id: `service-${Date.now()}`,
    businessId,
    name: request.name,
    description: request.description,
    durationMinutes: request.durationMinutes,
    price: request.price,
    currency: request.currency,
    categoryId: request.categoryId,
    isActive: true,
    bufferTimeBefore: request.bufferTimeBefore || 0,
    bufferTimeAfter: request.bufferTimeAfter || 0,
    maxAdvanceBookingDays: request.maxAdvanceBookingDays || 60,
    minAdvanceBookingHours: request.minAdvanceBookingHours || 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockStore.services.push(newService);
  return createSuccessResult(newService, 201);
}

function mockUpdateService(
  businessId: string,
  serviceId: string,
  request: UpdateServiceRequest
): OperationResult<Service> {
  const index = mockStore.services.findIndex(s => s.id === serviceId && s.businessId === businessId);

  if (index === -1) {
    return createNotFoundResult('Service');
  }

  const updatedService: Service = {
    ...mockStore.services[index],
    ...request,
    updatedAt: new Date().toISOString(),
  };

  mockStore.services[index] = updatedService;
  return createSuccessResult(updatedService);
}

function mockDeleteService(businessId: string, serviceId: string): OperationResult<null> {
  const index = mockStore.services.findIndex(s => s.id === serviceId && s.businessId === businessId);

  if (index === -1) {
    return createNotFoundResult('Service');
  }

  mockStore.services.splice(index, 1);
  return createSuccessResult(null);
}

function mockGetAllCategories(businessId: string): OperationResult<ServiceCategory[]> {
  const categories = mockStore.serviceCategories.filter(c => c.businessId === businessId);
  return createSuccessResult(categories);
}

function mockCreateCategory(
  businessId: string,
  request: { name: string; description?: string }
): OperationResult<ServiceCategory> {
  const maxSortOrder = Math.max(...mockStore.serviceCategories.map(c => c.sortOrder), 0);

  const newCategory: ServiceCategory = {
    id: `category-${Date.now()}`,
    businessId,
    name: request.name,
    description: request.description,
    sortOrder: maxSortOrder + 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockStore.serviceCategories.push(newCategory);
  return createSuccessResult(newCategory, 201);
}

function mockUpdateCategory(
  businessId: string,
  categoryId: string,
  request: { name?: string; description?: string; sortOrder?: number; isActive?: boolean }
): OperationResult<ServiceCategory> {
  const index = mockStore.serviceCategories.findIndex(c => c.id === categoryId && c.businessId === businessId);

  if (index === -1) {
    return createNotFoundResult('Service Category');
  }

  const updatedCategory: ServiceCategory = {
    ...mockStore.serviceCategories[index],
    ...request,
    updatedAt: new Date().toISOString(),
  };

  mockStore.serviceCategories[index] = updatedCategory;
  return createSuccessResult(updatedCategory);
}

function mockDeleteCategory(businessId: string, categoryId: string): OperationResult<null> {
  const index = mockStore.serviceCategories.findIndex(c => c.id === categoryId && c.businessId === businessId);

  if (index === -1) {
    return createNotFoundResult('Service Category');
  }

  mockStore.serviceCategories.splice(index, 1);
  return createSuccessResult(null);
}

// ============================================
// Service Functions
// ============================================

export async function getAllServices(
  businessId: string,
  params?: PaginationParams & { categoryId?: string }
): Promise<OperationResult<PaginatedResult<Service>>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return mockGetAllServices(businessId, params);
  }

  return apiGet<PaginatedResult<Service>>(
    SERVICE_ENDPOINTS.BASE(businessId),
    params as Record<string, string | number>
  );
}

export async function getServiceList(businessId: string): Promise<OperationResult<Service[]>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const services = mockStore.services.filter(s => s.businessId === businessId && s.isActive);
    return createSuccessResult(services);
  }

  return apiGet<Service[]>(SERVICE_ENDPOINTS.BASE(businessId));
}

export async function getServiceById(
  businessId: string,
  serviceId: string
): Promise<OperationResult<Service>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGetServiceById(businessId, serviceId);
  }

  return apiGet<Service>(SERVICE_ENDPOINTS.BY_ID(businessId, serviceId));
}

export async function createService(
  businessId: string,
  request: CreateServiceRequest
): Promise<OperationResult<Service>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCreateService(businessId, request);
  }

  return apiPost<Service, CreateServiceRequest>(SERVICE_ENDPOINTS.BASE(businessId), request);
}

export async function updateService(
  businessId: string,
  serviceId: string,
  request: UpdateServiceRequest
): Promise<OperationResult<Service>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUpdateService(businessId, serviceId, request);
  }

  return apiPut<Service, UpdateServiceRequest>(
    SERVICE_ENDPOINTS.BY_ID(businessId, serviceId),
    request
  );
}

export async function deleteService(
  businessId: string,
  serviceId: string
): Promise<OperationResult<null>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDeleteService(businessId, serviceId);
  }

  return apiDelete<null>(SERVICE_ENDPOINTS.BY_ID(businessId, serviceId));
}

// ============================================
// Category Functions
// ============================================

export async function getAllCategories(businessId: string): Promise<OperationResult<ServiceCategory[]>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGetAllCategories(businessId);
  }

  return apiGet<ServiceCategory[]>(SERVICE_ENDPOINTS.CATEGORIES(businessId));
}

export async function createCategory(
  businessId: string,
  request: { name: string; description?: string }
): Promise<OperationResult<ServiceCategory>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCreateCategory(businessId, request);
  }

  return apiPost<ServiceCategory, { name: string; description?: string }>(
    SERVICE_ENDPOINTS.CATEGORIES(businessId),
    request
  );
}

export async function updateCategory(
  businessId: string,
  categoryId: string,
  request: { name?: string; description?: string; sortOrder?: number; isActive?: boolean }
): Promise<OperationResult<ServiceCategory>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUpdateCategory(businessId, categoryId, request);
  }

  return apiPut<
    ServiceCategory,
    { name?: string; description?: string; sortOrder?: number; isActive?: boolean }
  >(SERVICE_ENDPOINTS.CATEGORY_BY_ID(businessId, categoryId), request);
}

export async function deleteCategory(
  businessId: string,
  categoryId: string
): Promise<OperationResult<null>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDeleteCategory(businessId, categoryId);
  }

  return apiDelete<null>(SERVICE_ENDPOINTS.CATEGORY_BY_ID(businessId, categoryId));
}
