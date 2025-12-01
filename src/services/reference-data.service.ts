import { OperationResult, createSuccessResult } from '@/types/api';
import { Country, Timezone, BusinessTypeOption, DashboardStats } from '@/types';
import { apiGet, isMockMode } from './api-client';
import { mockCountries, mockTimezones, mockBusinessTypes, mockDashboardStats } from './mock-data';

// ============================================
// Reference Data API Service
// ============================================

const REFERENCE_ENDPOINTS = {
  COUNTRIES: '/reference/countries',
  TIMEZONES: '/reference/timezones',
  BUSINESS_TYPES: '/reference/business-types',
  DASHBOARD: (businessId: string) => `/businesses/${businessId}/dashboard`,
} as const;

// ============================================
// Reference Data Service Functions
// ============================================

export async function getCountries(): Promise<OperationResult<Country[]>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return createSuccessResult(mockCountries);
  }

  return apiGet<Country[]>(REFERENCE_ENDPOINTS.COUNTRIES);
}

export async function getTimezones(): Promise<OperationResult<Timezone[]>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return createSuccessResult(mockTimezones);
  }

  return apiGet<Timezone[]>(REFERENCE_ENDPOINTS.TIMEZONES);
}

export async function getBusinessTypes(): Promise<OperationResult<BusinessTypeOption[]>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return createSuccessResult(mockBusinessTypes);
  }

  return apiGet<BusinessTypeOption[]>(REFERENCE_ENDPOINTS.BUSINESS_TYPES);
}

export async function getDashboardStats(businessId: string): Promise<OperationResult<DashboardStats>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return createSuccessResult(mockDashboardStats);
  }

  return apiGet<DashboardStats>(REFERENCE_ENDPOINTS.DASHBOARD(businessId));
}
