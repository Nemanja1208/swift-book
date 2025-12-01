/**
 * Shared Mock Data Store
 *
 * This module provides a centralized store for mock data that persists
 * across all service modules during a session. This ensures that when
 * a booking is created, it appears in the dashboard stats, etc.
 */

import {
  User,
  Business,
  Staff,
  Service,
  ServiceCategory,
  Customer,
  Booking,
  WorkingHours,
} from '@/types';
import {
  mockUsers,
  mockBusinesses,
  mockStaff,
  mockServices,
  mockServiceCategories,
  mockCustomers,
  mockBookings,
  mockWorkingHours,
} from './mock-data';

// ============================================
// Shared State Store
// ============================================

class MockStore {
  users: User[] = [...mockUsers];
  businesses: Business[] = [...mockBusinesses];
  staff: Staff[] = [...mockStaff];
  services: Service[] = [...mockServices];
  serviceCategories: ServiceCategory[] = [...mockServiceCategories];
  customers: Customer[] = [...mockCustomers];
  bookings: Booking[] = [...mockBookings];
  workingHours: WorkingHours[] = [...mockWorkingHours];

  // Reset all data to initial state
  reset() {
    this.users = [...mockUsers];
    this.businesses = [...mockBusinesses];
    this.staff = [...mockStaff];
    this.services = [...mockServices];
    this.serviceCategories = [...mockServiceCategories];
    this.customers = [...mockCustomers];
    this.bookings = [...mockBookings];
    this.workingHours = [...mockWorkingHours];
  }

  // Booking helpers
  addBooking(booking: Booking) {
    this.bookings.push(booking);
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.find(b => b.id === id);
  }

  updateBooking(id: string, updates: Partial<Booking>) {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings[index] = { ...this.bookings[index], ...updates };
    }
  }

  // Customer helpers
  addCustomer(customer: Customer) {
    this.customers.push(customer);
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find(c => c.id === id);
  }

  findCustomerByEmail(email: string): Customer | undefined {
    return this.customers.find(c => c.email === email);
  }

  // Get upcoming bookings (for dashboard)
  getUpcomingBookings(businessId: string, limit = 5): Booking[] {
    const now = new Date();
    return this.bookings
      .filter(
        b =>
          b.businessId === businessId &&
          (b.status === 'confirmed' || b.status === 'pending') &&
          new Date(b.startTime) >= now
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, limit);
  }

  // Get today's bookings count
  getTodayBookingsCount(businessId: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.bookings.filter(
      b =>
        b.businessId === businessId &&
        b.status !== 'cancelled' &&
        new Date(b.startTime) >= today &&
        new Date(b.startTime) < tomorrow
    ).length;
  }

  // Get week's bookings count
  getWeekBookingsCount(businessId: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return this.bookings.filter(
      b =>
        b.businessId === businessId &&
        b.status !== 'cancelled' &&
        new Date(b.startTime) >= today &&
        new Date(b.startTime) < weekFromNow
    ).length;
  }

  // Get month's bookings count
  getMonthBookingsCount(businessId: string): number {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.bookings.filter(
      b =>
        b.businessId === businessId &&
        b.status !== 'cancelled' &&
        new Date(b.startTime) >= startOfMonth &&
        new Date(b.startTime) <= endOfMonth
    ).length;
  }
}

// Singleton instance
export const mockStore = new MockStore();
