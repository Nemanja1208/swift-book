import { OperationResult, createSuccessResult, createErrorResult, createNotFoundResult, ErrorCodes } from '@/types/api';
import { Staff, CreateStaffRequest, UpdateStaffRequest, WorkingHours, PaginatedResult, PaginationParams } from '@/types';
import { apiGet, apiPost, apiPut, apiDelete, isMockMode } from './api-client';
import { mockStore } from './mock-store';

// ============================================
// Staff API Service
// ============================================

const STAFF_ENDPOINTS = {
  BASE: (businessId: string) => `/businesses/${businessId}/staff`,
  BY_ID: (businessId: string, staffId: string) => `/businesses/${businessId}/staff/${staffId}`,
  WORKING_HOURS: (businessId: string, staffId: string) => `/businesses/${businessId}/staff/${staffId}/working-hours`,
} as const;

// ============================================
// Mock Handlers
// ============================================

function mockGetAllStaff(businessId: string, params?: PaginationParams): OperationResult<PaginatedResult<Staff>> {
  const staffForBusiness = mockStore.staff.filter(s => s.businessId === businessId);
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const items = staffForBusiness.slice(startIndex, endIndex);

  return createSuccessResult({
    items,
    totalCount: staffForBusiness.length,
    page,
    pageSize,
    totalPages: Math.ceil(staffForBusiness.length / pageSize),
    hasNextPage: endIndex < staffForBusiness.length,
    hasPreviousPage: page > 1,
  });
}

function mockGetStaffById(businessId: string, staffId: string): OperationResult<Staff> {
  const staff = mockStore.staff.find(s => s.id === staffId && s.businessId === businessId);

  if (!staff) {
    return createNotFoundResult('Staff member');
  }

  return createSuccessResult(staff);
}

function mockCreateStaff(businessId: string, request: CreateStaffRequest): OperationResult<Staff> {
  const existingStaff = mockStore.staff.find(
    s => s.businessId === businessId && s.user?.email === request.email
  );

  if (existingStaff) {
    return createErrorResult(
      ErrorCodes.STAFF_ALREADY_EXISTS,
      'A staff member with this email already exists in this business',
      409
    );
  }

  const newStaff: Staff = {
    id: `staff-${Date.now()}`,
    userId: `user-${Date.now()}`,
    businessId,
    role: request.role,
    title: request.title,
    bio: request.bio,
    isActive: true,
    user: {
      id: `user-${Date.now()}`,
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      isEmailVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockStore.staff.push(newStaff);
  return createSuccessResult(newStaff, 201);
}

function mockUpdateStaff(businessId: string, staffId: string, request: UpdateStaffRequest): OperationResult<Staff> {
  const index = mockStore.staff.findIndex(s => s.id === staffId && s.businessId === businessId);

  if (index === -1) {
    return createNotFoundResult('Staff member');
  }

  const updatedStaff: Staff = {
    ...mockStore.staff[index],
    ...request,
    updatedAt: new Date().toISOString(),
  };

  mockStore.staff[index] = updatedStaff;
  return createSuccessResult(updatedStaff);
}

function mockDeleteStaff(businessId: string, staffId: string): OperationResult<null> {
  const staff = mockStore.staff.find(s => s.id === staffId && s.businessId === businessId);

  if (!staff) {
    return createNotFoundResult('Staff member');
  }

  if (staff.role === 'owner') {
    return createErrorResult(
      ErrorCodes.CANNOT_REMOVE_OWNER,
      'Cannot remove the business owner',
      400
    );
  }

  const index = mockStore.staff.findIndex(s => s.id === staffId);
  mockStore.staff.splice(index, 1);
  return createSuccessResult(null);
}

function mockGetWorkingHours(staffId: string): OperationResult<WorkingHours[]> {
  const hours = mockStore.workingHours.filter(h => h.staffId === staffId);
  return createSuccessResult(hours);
}

function mockUpdateWorkingHours(staffId: string, hours: WorkingHours[]): OperationResult<WorkingHours[]> {
  // Remove existing hours for this staff
  mockStore.workingHours = mockStore.workingHours.filter(h => h.staffId !== staffId);

  // Add updated hours
  const updatedHours = hours.map(h => ({
    ...h,
    staffId,
    updatedAt: new Date().toISOString(),
  }));

  mockStore.workingHours.push(...updatedHours);
  return createSuccessResult(updatedHours);
}

// ============================================
// Staff Service Functions
// ============================================

export async function getAllStaff(
  businessId: string,
  params?: PaginationParams
): Promise<OperationResult<PaginatedResult<Staff>>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return mockGetAllStaff(businessId, params);
  }

  return apiGet<PaginatedResult<Staff>>(
    STAFF_ENDPOINTS.BASE(businessId),
    params as Record<string, string | number>
  );
}

export async function getStaffList(businessId: string): Promise<OperationResult<Staff[]>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const staffForBusiness = mockStore.staff.filter(s => s.businessId === businessId);
    return createSuccessResult(staffForBusiness);
  }

  return apiGet<Staff[]>(STAFF_ENDPOINTS.BASE(businessId));
}

export async function getStaffById(
  businessId: string,
  staffId: string
): Promise<OperationResult<Staff>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGetStaffById(businessId, staffId);
  }

  return apiGet<Staff>(STAFF_ENDPOINTS.BY_ID(businessId, staffId));
}

export async function createStaff(
  businessId: string,
  request: CreateStaffRequest
): Promise<OperationResult<Staff>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCreateStaff(businessId, request);
  }

  return apiPost<Staff, CreateStaffRequest>(STAFF_ENDPOINTS.BASE(businessId), request);
}

export async function updateStaff(
  businessId: string,
  staffId: string,
  request: UpdateStaffRequest
): Promise<OperationResult<Staff>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUpdateStaff(businessId, staffId, request);
  }

  return apiPut<Staff, UpdateStaffRequest>(STAFF_ENDPOINTS.BY_ID(businessId, staffId), request);
}

export async function deleteStaff(businessId: string, staffId: string): Promise<OperationResult<null>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDeleteStaff(businessId, staffId);
  }

  return apiDelete<null>(STAFF_ENDPOINTS.BY_ID(businessId, staffId));
}

export async function getStaffWorkingHours(
  businessId: string,
  staffId: string
): Promise<OperationResult<WorkingHours[]>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGetWorkingHours(staffId);
  }

  return apiGet<WorkingHours[]>(STAFF_ENDPOINTS.WORKING_HOURS(businessId, staffId));
}

export async function updateStaffWorkingHours(
  businessId: string,
  staffId: string,
  hours: WorkingHours[]
): Promise<OperationResult<WorkingHours[]>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUpdateWorkingHours(staffId, hours);
  }

  return apiPut<WorkingHours[], WorkingHours[]>(
    STAFF_ENDPOINTS.WORKING_HOURS(businessId, staffId),
    hours
  );
}
