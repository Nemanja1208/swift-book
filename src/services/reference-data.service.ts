import { OperationResult, createSuccessResult } from '@/types/api';
import { Country, Timezone, BusinessTypeOption, DashboardStats, ServiceStats } from '@/types';
import { apiGet, isMockMode } from './api-client';
import { mockCountries, mockTimezones, mockBusinessTypes } from './mock-data';
import { mockStore } from './mock-store';

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
// Mock Dashboard Stats (Dynamic)
// ============================================

function getMockDashboardStats(businessId: string): DashboardStats {
  const upcomingBookings = mockStore.getUpcomingBookings(businessId, 5);

  // Calculate service stats from bookings
  const serviceBookingMap = new Map<string, { count: number; revenue: number; name: string }>();

  mockStore.bookings
    .filter(b => b.businessId === businessId && b.status !== 'cancelled')
    .forEach(booking => {
      const existing = serviceBookingMap.get(booking.serviceId) || {
        count: 0,
        revenue: 0,
        name: booking.service?.name || 'Unknown Service',
      };
      existing.count += 1;
      existing.revenue += booking.price;
      serviceBookingMap.set(booking.serviceId, existing);
    });

  const popularServices: ServiceStats[] = Array.from(serviceBookingMap.entries())
    .map(([serviceId, data]) => ({
      serviceId,
      serviceName: data.name,
      bookingCount: data.count,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 4);

  // Calculate total revenue
  const totalRevenue = mockStore.bookings
    .filter(b => b.businessId === businessId && b.status === 'completed')
    .reduce((sum, b) => sum + b.price, 0);

  const completedBookings = mockStore.bookings.filter(
    b => b.businessId === businessId && b.status === 'completed'
  ).length;

  return {
    todayBookings: mockStore.getTodayBookingsCount(businessId),
    weekBookings: mockStore.getWeekBookingsCount(businessId),
    monthBookings: mockStore.getMonthBookingsCount(businessId),
    totalCustomers: mockStore.customers.filter(c => c.businessId === businessId).length,
    totalRevenue,
    averageBookingValue: completedBookings > 0 ? Math.round(totalRevenue / completedBookings) : 0,
    popularServices,
    upcomingBookings,
  };
}

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
    return createSuccessResult(getMockDashboardStats(businessId));
  }

  return apiGet<DashboardStats>(REFERENCE_ENDPOINTS.DASHBOARD(businessId));
}
