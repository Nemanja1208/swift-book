import { OperationResult, createSuccessResult, createErrorResult, createNotFoundResult, ErrorCodes } from '@/types/api';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest, PaginatedResult, PaginationParams } from '@/types';
import { apiGet, apiPost, apiPut, apiDelete, isMockMode } from './api-client';
import { mockCustomers } from './mock-data';

// ============================================
// Customer API Service
// ============================================

const CUSTOMER_ENDPOINTS = {
  BASE: (businessId: string) => `/businesses/${businessId}/customers`,
  BY_ID: (businessId: string, customerId: string) => `/businesses/${businessId}/customers/${customerId}`,
  SEARCH: (businessId: string) => `/businesses/${businessId}/customers/search`,
} as const;

// Local mock data store
let localMockCustomers = [...mockCustomers];

// ============================================
// Mock Handlers
// ============================================

function mockGetAllCustomers(
  businessId: string,
  params?: PaginationParams & { search?: string; tags?: string[] }
): OperationResult<PaginatedResult<Customer>> {
  let customersForBusiness = localMockCustomers.filter(c => c.businessId === businessId);

  // Apply search filter
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    customersForBusiness = customersForBusiness.filter(
      c =>
        c.firstName.toLowerCase().includes(searchLower) ||
        c.lastName.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.phoneNumber?.includes(params.search || '')
    );
  }

  // Apply tag filter
  if (params?.tags && params.tags.length > 0) {
    customersForBusiness = customersForBusiness.filter(c =>
      params.tags!.some(tag => c.tags?.includes(tag))
    );
  }

  // Sort by last visit (most recent first) by default
  customersForBusiness.sort((a, b) => {
    const dateA = a.lastVisitAt ? new Date(a.lastVisitAt).getTime() : 0;
    const dateB = b.lastVisitAt ? new Date(b.lastVisitAt).getTime() : 0;
    return dateB - dateA;
  });

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const items = customersForBusiness.slice(startIndex, endIndex);

  return createSuccessResult({
    items,
    totalCount: customersForBusiness.length,
    page,
    pageSize,
    totalPages: Math.ceil(customersForBusiness.length / pageSize),
    hasNextPage: endIndex < customersForBusiness.length,
    hasPreviousPage: page > 1,
  });
}

function mockGetCustomerById(businessId: string, customerId: string): OperationResult<Customer> {
  const customer = localMockCustomers.find(c => c.id === customerId && c.businessId === businessId);

  if (!customer) {
    return createNotFoundResult('Customer');
  }

  return createSuccessResult(customer);
}

function mockSearchCustomers(
  businessId: string,
  query: string
): OperationResult<Customer[]> {
  const queryLower = query.toLowerCase();
  const customers = localMockCustomers.filter(
    c =>
      c.businessId === businessId &&
      (c.firstName.toLowerCase().includes(queryLower) ||
        c.lastName.toLowerCase().includes(queryLower) ||
        c.email.toLowerCase().includes(queryLower) ||
        c.phoneNumber?.includes(query))
  );

  return createSuccessResult(customers.slice(0, 10)); // Limit to 10 results for search
}

function mockCreateCustomer(
  businessId: string,
  request: CreateCustomerRequest
): OperationResult<Customer> {
  const existingCustomer = localMockCustomers.find(
    c => c.businessId === businessId && c.email === request.email
  );

  if (existingCustomer) {
    return createErrorResult(
      ErrorCodes.CUSTOMER_EMAIL_EXISTS,
      'A customer with this email already exists',
      409
    );
  }

  const newCustomer: Customer = {
    id: `customer-${Date.now()}`,
    businessId,
    email: request.email,
    firstName: request.firstName,
    lastName: request.lastName,
    phoneNumber: request.phoneNumber,
    notes: request.notes,
    tags: request.tags || [],
    totalBookings: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  localMockCustomers.push(newCustomer);
  return createSuccessResult(newCustomer, 201);
}

function mockUpdateCustomer(
  businessId: string,
  customerId: string,
  request: UpdateCustomerRequest
): OperationResult<Customer> {
  const index = localMockCustomers.findIndex(c => c.id === customerId && c.businessId === businessId);

  if (index === -1) {
    return createNotFoundResult('Customer');
  }

  // Check email uniqueness if email is being updated
  if (request.email && request.email !== localMockCustomers[index].email) {
    const existingCustomer = localMockCustomers.find(
      c => c.businessId === businessId && c.email === request.email && c.id !== customerId
    );

    if (existingCustomer) {
      return createErrorResult(
        ErrorCodes.CUSTOMER_EMAIL_EXISTS,
        'A customer with this email already exists',
        409
      );
    }
  }

  const updatedCustomer: Customer = {
    ...localMockCustomers[index],
    ...request,
    updatedAt: new Date().toISOString(),
  };

  localMockCustomers[index] = updatedCustomer;
  return createSuccessResult(updatedCustomer);
}

function mockDeleteCustomer(businessId: string, customerId: string): OperationResult<null> {
  const index = localMockCustomers.findIndex(c => c.id === customerId && c.businessId === businessId);

  if (index === -1) {
    return createNotFoundResult('Customer');
  }

  localMockCustomers.splice(index, 1);
  return createSuccessResult(null);
}

// ============================================
// Customer Service Functions
// ============================================

export async function getAllCustomers(
  businessId: string,
  params?: PaginationParams & { search?: string; tags?: string[] }
): Promise<OperationResult<PaginatedResult<Customer>>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return mockGetAllCustomers(businessId, params);
  }

  return apiGet<PaginatedResult<Customer>>(
    CUSTOMER_ENDPOINTS.BASE(businessId),
    params as Record<string, string | number>
  );
}

export async function getCustomerById(
  businessId: string,
  customerId: string
): Promise<OperationResult<Customer>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGetCustomerById(businessId, customerId);
  }

  return apiGet<Customer>(CUSTOMER_ENDPOINTS.BY_ID(businessId, customerId));
}

export async function searchCustomers(
  businessId: string,
  query: string
): Promise<OperationResult<Customer[]>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockSearchCustomers(businessId, query);
  }

  return apiGet<Customer[]>(CUSTOMER_ENDPOINTS.SEARCH(businessId), { q: query });
}

export async function createCustomer(
  businessId: string,
  request: CreateCustomerRequest
): Promise<OperationResult<Customer>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCreateCustomer(businessId, request);
  }

  return apiPost<Customer, CreateCustomerRequest>(CUSTOMER_ENDPOINTS.BASE(businessId), request);
}

export async function updateCustomer(
  businessId: string,
  customerId: string,
  request: UpdateCustomerRequest
): Promise<OperationResult<Customer>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUpdateCustomer(businessId, customerId, request);
  }

  return apiPut<Customer, UpdateCustomerRequest>(
    CUSTOMER_ENDPOINTS.BY_ID(businessId, customerId),
    request
  );
}

export async function deleteCustomer(
  businessId: string,
  customerId: string
): Promise<OperationResult<null>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDeleteCustomer(businessId, customerId);
  }

  return apiDelete<null>(CUSTOMER_ENDPOINTS.BY_ID(businessId, customerId));
}
