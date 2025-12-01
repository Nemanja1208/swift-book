import {
  OperationResult,
  createSuccessResult,
  createErrorResult,
  createNotFoundResult,
  ErrorCodes,
} from '@/types/api';
import {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  CancelBookingRequest,
  AvailabilityRequest,
  AvailabilityResponse,
  TimeSlot,
  PaginatedResult,
  PaginationParams,
  BookingStatus,
  Customer,
} from '@/types';
import { apiGet, apiPost, apiPut, apiPatch, isMockMode } from './api-client';
import { mockStore } from './mock-store';

// ============================================
// Booking API Service
// ============================================

const BOOKING_ENDPOINTS = {
  BASE: (businessId: string) => `/businesses/${businessId}/bookings`,
  BY_ID: (businessId: string, bookingId: string) => `/businesses/${businessId}/bookings/${bookingId}`,
  CANCEL: (businessId: string, bookingId: string) => `/businesses/${businessId}/bookings/${bookingId}/cancel`,
  CONFIRM: (businessId: string, bookingId: string) => `/businesses/${businessId}/bookings/${bookingId}/confirm`,
  COMPLETE: (businessId: string, bookingId: string) => `/businesses/${businessId}/bookings/${bookingId}/complete`,
  NO_SHOW: (businessId: string, bookingId: string) => `/businesses/${businessId}/bookings/${bookingId}/no-show`,
  AVAILABILITY: (businessId: string) => `/businesses/${businessId}/availability`,
} as const;

// ============================================
// Mock Handlers
// ============================================

function mockGetAllBookings(
  businessId: string,
  params?: PaginationParams & {
    status?: BookingStatus;
    staffId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }
): OperationResult<PaginatedResult<Booking>> {
  let bookingsForBusiness = mockStore.bookings.filter(b => b.businessId === businessId);

  // Apply filters
  if (params?.status) {
    bookingsForBusiness = bookingsForBusiness.filter(b => b.status === params.status);
  }

  if (params?.staffId) {
    bookingsForBusiness = bookingsForBusiness.filter(b => b.staffId === params.staffId);
  }

  if (params?.customerId) {
    bookingsForBusiness = bookingsForBusiness.filter(b => b.customerId === params.customerId);
  }

  if (params?.startDate) {
    bookingsForBusiness = bookingsForBusiness.filter(
      b => new Date(b.startTime) >= new Date(params.startDate!)
    );
  }

  if (params?.endDate) {
    bookingsForBusiness = bookingsForBusiness.filter(
      b => new Date(b.startTime) <= new Date(params.endDate!)
    );
  }

  // Sort by start time (upcoming first)
  bookingsForBusiness.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const items = bookingsForBusiness.slice(startIndex, endIndex);

  return createSuccessResult({
    items,
    totalCount: bookingsForBusiness.length,
    page,
    pageSize,
    totalPages: Math.ceil(bookingsForBusiness.length / pageSize),
    hasNextPage: endIndex < bookingsForBusiness.length,
    hasPreviousPage: page > 1,
  });
}

function mockGetBookingById(businessId: string, bookingId: string): OperationResult<Booking> {
  const booking = mockStore.bookings.find(b => b.id === bookingId && b.businessId === businessId);

  if (!booking) {
    return createNotFoundResult('Booking');
  }

  return createSuccessResult(booking);
}

function mockGetAvailability(
  businessId: string,
  request: AvailabilityRequest
): OperationResult<AvailabilityResponse> {
  const service = mockStore.services.find(s => s.id === request.serviceId);

  if (!service) {
    return createNotFoundResult('Service');
  }

  // Generate mock availability slots for the requested date
  const date = new Date(request.date);
  const slots: TimeSlot[] = [];

  // Generate slots from 9 AM to 6 PM
  for (let hour = 9; hour < 18; hour++) {
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);

    // Check if slot overlaps with existing bookings
    const isBooked = mockStore.bookings.some(
      b =>
        b.businessId === businessId &&
        b.status !== 'cancelled' &&
        (!request.staffId || b.staffId === request.staffId) &&
        new Date(b.startTime) < endTime &&
        new Date(b.endTime) > startTime
    );

    slots.push({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isAvailable: !isBooked,
    });
  }

  return createSuccessResult({
    date: request.date,
    slots,
  });
}

function mockCreateBooking(businessId: string, request: CreateBookingRequest): OperationResult<Booking> {
  const service = mockStore.services.find(s => s.id === request.serviceId);
  if (!service) {
    return createNotFoundResult('Service');
  }

  const staff = mockStore.staff.find(s => s.id === request.staffId);
  if (!staff) {
    return createNotFoundResult('Staff member');
  }

  // Check availability
  const startTime = new Date(request.startTime);
  const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);

  const hasConflict = mockStore.bookings.some(
    b =>
      b.businessId === businessId &&
      b.staffId === request.staffId &&
      b.status !== 'cancelled' &&
      new Date(b.startTime) < endTime &&
      new Date(b.endTime) > startTime
  );

  if (hasConflict) {
    return createErrorResult(
      ErrorCodes.SLOT_NOT_AVAILABLE,
      'The selected time slot is no longer available',
      409
    );
  }

  // Find or create customer
  let customer: Customer | undefined = mockStore.customers.find(c => c.id === request.customerId);

  if (!customer && request.customerEmail) {
    // Check if customer with this email exists
    customer = mockStore.findCustomerByEmail(request.customerEmail);

    if (!customer) {
      // Create new customer
      customer = {
        id: `customer-${Date.now()}`,
        businessId,
        email: request.customerEmail,
        firstName: request.customerFirstName || '',
        lastName: request.customerLastName || '',
        phoneNumber: request.customerPhoneNumber,
        totalBookings: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockStore.addCustomer(customer);
    }
  }

  if (!customer) {
    return createErrorResult(
      ErrorCodes.CUSTOMER_NOT_FOUND,
      'Customer information is required',
      400
    );
  }

  const newBooking: Booking = {
    id: `booking-${Date.now()}`,
    businessId,
    customerId: customer.id,
    staffId: request.staffId,
    serviceId: request.serviceId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    status: 'confirmed', // Auto-confirm for now
    notes: request.notes,
    price: service.price,
    currency: service.currency,
    customer,
    staff,
    service,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add to store
  mockStore.addBooking(newBooking);

  // Update customer stats
  customer.totalBookings += 1;
  customer.totalSpent += service.price;
  customer.lastVisitAt = startTime.toISOString();

  return createSuccessResult(newBooking, 201);
}

function mockUpdateBooking(
  businessId: string,
  bookingId: string,
  request: UpdateBookingRequest
): OperationResult<Booking> {
  const booking = mockStore.bookings.find(b => b.id === bookingId && b.businessId === businessId);

  if (!booking) {
    return createNotFoundResult('Booking');
  }

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return createErrorResult(
      ErrorCodes.BAD_REQUEST,
      `Cannot update a ${booking.status} booking`,
      400
    );
  }

  // Check availability if rescheduling
  if (request.startTime) {
    const startTime = new Date(request.startTime);
    const service = mockStore.services.find(s => s.id === booking.serviceId);
    const endTime = new Date(startTime.getTime() + (service?.durationMinutes || 60) * 60 * 1000);

    const hasConflict = mockStore.bookings.some(
      b =>
        b.id !== bookingId &&
        b.businessId === businessId &&
        b.staffId === (request.staffId || booking.staffId) &&
        b.status !== 'cancelled' &&
        new Date(b.startTime) < endTime &&
        new Date(b.endTime) > startTime
    );

    if (hasConflict) {
      return createErrorResult(
        ErrorCodes.SLOT_NOT_AVAILABLE,
        'The selected time slot is not available',
        409
      );
    }
  }

  // Update booking in store
  const updates: Partial<Booking> = {
    ...request,
    updatedAt: new Date().toISOString(),
  };

  if (request.startTime && booking.service) {
    updates.endTime = new Date(
      new Date(request.startTime).getTime() + booking.service.durationMinutes * 60 * 1000
    ).toISOString();
  }

  mockStore.updateBooking(bookingId, updates);

  const updatedBooking = mockStore.getBookingById(bookingId);
  return createSuccessResult(updatedBooking!);
}

function mockCancelBooking(
  businessId: string,
  bookingId: string,
  request?: CancelBookingRequest
): OperationResult<Booking> {
  const booking = mockStore.bookings.find(b => b.id === bookingId && b.businessId === businessId);

  if (!booking) {
    return createNotFoundResult('Booking');
  }

  if (booking.status === 'cancelled') {
    return createErrorResult(
      ErrorCodes.BOOKING_ALREADY_CANCELLED,
      'This booking has already been cancelled',
      400
    );
  }

  if (booking.status === 'completed') {
    return createErrorResult(
      ErrorCodes.BAD_REQUEST,
      'Cannot cancel a completed booking',
      400
    );
  }

  mockStore.updateBooking(bookingId, {
    status: 'cancelled',
    cancellationReason: request?.reason,
    cancelledAt: new Date().toISOString(),
    cancelledBy: 'staff',
    updatedAt: new Date().toISOString(),
  });

  const updatedBooking = mockStore.getBookingById(bookingId);
  return createSuccessResult(updatedBooking!);
}

function mockConfirmBooking(businessId: string, bookingId: string): OperationResult<Booking> {
  const booking = mockStore.bookings.find(b => b.id === bookingId && b.businessId === businessId);

  if (!booking) {
    return createNotFoundResult('Booking');
  }

  if (booking.status !== 'pending') {
    return createErrorResult(
      ErrorCodes.BAD_REQUEST,
      'Only pending bookings can be confirmed',
      400
    );
  }

  mockStore.updateBooking(bookingId, {
    status: 'confirmed',
    updatedAt: new Date().toISOString(),
  });

  const updatedBooking = mockStore.getBookingById(bookingId);
  return createSuccessResult(updatedBooking!);
}

function mockCompleteBooking(businessId: string, bookingId: string): OperationResult<Booking> {
  const booking = mockStore.bookings.find(b => b.id === bookingId && b.businessId === businessId);

  if (!booking) {
    return createNotFoundResult('Booking');
  }

  if (booking.status === 'cancelled') {
    return createErrorResult(
      ErrorCodes.BAD_REQUEST,
      'Cannot complete a cancelled booking',
      400
    );
  }

  mockStore.updateBooking(bookingId, {
    status: 'completed',
    updatedAt: new Date().toISOString(),
  });

  const updatedBooking = mockStore.getBookingById(bookingId);
  return createSuccessResult(updatedBooking!);
}

function mockMarkNoShow(businessId: string, bookingId: string): OperationResult<Booking> {
  const booking = mockStore.bookings.find(b => b.id === bookingId && b.businessId === businessId);

  if (!booking) {
    return createNotFoundResult('Booking');
  }

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return createErrorResult(
      ErrorCodes.BAD_REQUEST,
      `Cannot mark a ${booking.status} booking as no-show`,
      400
    );
  }

  mockStore.updateBooking(bookingId, {
    status: 'no_show',
    updatedAt: new Date().toISOString(),
  });

  const updatedBooking = mockStore.getBookingById(bookingId);
  return createSuccessResult(updatedBooking!);
}

// ============================================
// Booking Service Functions
// ============================================

export async function getAllBookings(
  businessId: string,
  params?: PaginationParams & {
    status?: BookingStatus;
    staffId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<OperationResult<PaginatedResult<Booking>>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return mockGetAllBookings(businessId, params);
  }

  return apiGet<PaginatedResult<Booking>>(
    BOOKING_ENDPOINTS.BASE(businessId),
    params as Record<string, string | number>
  );
}

export async function getBookingById(
  businessId: string,
  bookingId: string
): Promise<OperationResult<Booking>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGetBookingById(businessId, bookingId);
  }

  return apiGet<Booking>(BOOKING_ENDPOINTS.BY_ID(businessId, bookingId));
}

export async function getAvailability(
  businessId: string,
  request: AvailabilityRequest
): Promise<OperationResult<AvailabilityResponse>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockGetAvailability(businessId, request);
  }

  return apiGet<AvailabilityResponse>(
    BOOKING_ENDPOINTS.AVAILABILITY(businessId),
    request as Record<string, string>
  );
}

export async function createBooking(
  businessId: string,
  request: CreateBookingRequest
): Promise<OperationResult<Booking>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCreateBooking(businessId, request);
  }

  return apiPost<Booking, CreateBookingRequest>(BOOKING_ENDPOINTS.BASE(businessId), request);
}

export async function updateBooking(
  businessId: string,
  bookingId: string,
  request: UpdateBookingRequest
): Promise<OperationResult<Booking>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUpdateBooking(businessId, bookingId, request);
  }

  return apiPut<Booking, UpdateBookingRequest>(
    BOOKING_ENDPOINTS.BY_ID(businessId, bookingId),
    request
  );
}

export async function cancelBooking(
  businessId: string,
  bookingId: string,
  request?: CancelBookingRequest
): Promise<OperationResult<Booking>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCancelBooking(businessId, bookingId, request);
  }

  return apiPost<Booking, CancelBookingRequest>(
    BOOKING_ENDPOINTS.CANCEL(businessId, bookingId),
    request || {}
  );
}

export async function confirmBooking(
  businessId: string,
  bookingId: string
): Promise<OperationResult<Booking>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockConfirmBooking(businessId, bookingId);
  }

  return apiPatch<Booking>(BOOKING_ENDPOINTS.CONFIRM(businessId, bookingId));
}

export async function completeBooking(
  businessId: string,
  bookingId: string
): Promise<OperationResult<Booking>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCompleteBooking(businessId, bookingId);
  }

  return apiPatch<Booking>(BOOKING_ENDPOINTS.COMPLETE(businessId, bookingId));
}

export async function markBookingNoShow(
  businessId: string,
  bookingId: string
): Promise<OperationResult<Booking>> {
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMarkNoShow(businessId, bookingId);
  }

  return apiPatch<Booking>(BOOKING_ENDPOINTS.NO_SHOW(businessId, bookingId));
}

// ============================================
// Helper Functions
// ============================================

export async function getTodayBookings(businessId: string): Promise<OperationResult<Booking[]>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await getAllBookings(businessId, {
    startDate: today.toISOString(),
    endDate: tomorrow.toISOString(),
    pageSize: 100,
  });

  if (result.isSuccess && result.data) {
    return createSuccessResult(result.data.items);
  }

  return result as unknown as OperationResult<Booking[]>;
}

export async function getUpcomingBookings(
  businessId: string,
  limit = 5
): Promise<OperationResult<Booking[]>> {
  const now = new Date();

  const result = await getAllBookings(businessId, {
    startDate: now.toISOString(),
    pageSize: limit,
  });

  if (result.isSuccess && result.data) {
    return createSuccessResult(
      result.data.items.filter(b => b.status === 'confirmed' || b.status === 'pending')
    );
  }

  return result as unknown as OperationResult<Booking[]>;
}
