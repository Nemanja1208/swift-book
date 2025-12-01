// ============================================
// Domain Models - Mirror .NET Clean Architecture Domain Layer
// ============================================

// Base Entity
export interface BaseEntity {
  id: string;
  createdAt: string; // ISO 8601 DateTime
  updatedAt: string; // ISO 8601 DateTime
}

// ============================================
// User & Authentication
// ============================================

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============================================
// Business
// ============================================

export type BusinessType =
  | 'hair_salon'
  | 'barber_shop'
  | 'spa_wellness'
  | 'beauty_clinic'
  | 'personal_training'
  | 'therapy_coaching'
  | 'other';

export interface Business extends BaseEntity {
  ownerId: string;
  name: string;
  type: BusinessType;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  country: string;
  timezone: string;
  address?: Address;
  isActive: boolean;
  slug: string; // URL-friendly unique identifier
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateBusinessRequest {
  name: string;
  type: BusinessType;
  description?: string;
  country: string;
  timezone: string;
  address?: Address;
}

export interface UpdateBusinessRequest {
  name?: string;
  type?: BusinessType;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  country?: string;
  timezone?: string;
  address?: Address;
}

// ============================================
// Staff
// ============================================

export type StaffRole = 'owner' | 'admin' | 'manager' | 'staff';

export interface Staff extends BaseEntity {
  userId: string;
  businessId: string;
  role: StaffRole;
  title?: string;
  bio?: string;
  profileImageUrl?: string;
  isActive: boolean;
  user?: User;
}

export interface CreateStaffRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  title?: string;
  bio?: string;
}

export interface UpdateStaffRequest {
  role?: StaffRole;
  title?: string;
  bio?: string;
  isActive?: boolean;
}

// ============================================
// Service
// ============================================

export interface Service extends BaseEntity {
  businessId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  currency: string;
  categoryId?: string;
  imageUrl?: string;
  isActive: boolean;
  bufferTimeBefore?: number; // minutes
  bufferTimeAfter?: number; // minutes
  maxAdvanceBookingDays?: number;
  minAdvanceBookingHours?: number;
}

export interface ServiceCategory extends BaseEntity {
  businessId: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  currency: string;
  categoryId?: string;
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  maxAdvanceBookingDays?: number;
  minAdvanceBookingHours?: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  currency?: string;
  categoryId?: string;
  imageUrl?: string;
  isActive?: boolean;
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  maxAdvanceBookingDays?: number;
  minAdvanceBookingHours?: number;
}

// ============================================
// Staff-Service Assignment
// ============================================

export interface StaffService extends BaseEntity {
  staffId: string;
  serviceId: string;
  customPrice?: number;
  customDurationMinutes?: number;
}

// ============================================
// Working Hours / Schedule
// ============================================

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0

export interface WorkingHours extends BaseEntity {
  staffId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isEnabled: boolean;
}

export interface TimeSlot {
  startTime: string; // ISO 8601 DateTime
  endTime: string; // ISO 8601 DateTime
  isAvailable: boolean;
}

export interface AvailabilityRequest {
  staffId?: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
}

// ============================================
// Booking / Appointment
// ============================================

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface Booking extends BaseEntity {
  businessId: string;
  customerId: string;
  staffId: string;
  serviceId: string;
  startTime: string; // ISO 8601 DateTime
  endTime: string; // ISO 8601 DateTime
  status: BookingStatus;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  price: number;
  currency: string;
  // Expanded relations
  customer?: Customer;
  staff?: Staff;
  service?: Service;
}

export interface CreateBookingRequest {
  customerId?: string; // Optional if customer info is provided
  staffId: string;
  serviceId: string;
  startTime: string;
  notes?: string;
  // Guest booking fields
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhoneNumber?: string;
}

export interface UpdateBookingRequest {
  staffId?: string;
  startTime?: string;
  notes?: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

// ============================================
// Customer
// ============================================

export interface Customer extends BaseEntity {
  businessId: string;
  userId?: string; // Optional - linked if customer has account
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  notes?: string;
  tags?: string[];
  totalBookings: number;
  totalSpent: number;
  lastVisitAt?: string;
}

export interface CreateCustomerRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateCustomerRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  notes?: string;
  tags?: string[];
}

// ============================================
// Notifications
// ============================================

export type NotificationType =
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_cancelled'
  | 'booking_rescheduled';

export interface NotificationSettings extends BaseEntity {
  businessId: string;
  type: NotificationType;
  isEmailEnabled: boolean;
  isSmsEnabled: boolean;
  emailTemplateId?: string;
  smsTemplateId?: string;
  reminderHoursBefore?: number;
}

// ============================================
// Lookup/Reference Data
// ============================================

export interface Country {
  code: string;
  name: string;
}

export interface Timezone {
  id: string;
  name: string;
  offset: string;
}

export interface BusinessTypeOption {
  value: BusinessType;
  label: string;
}

// ============================================
// Pagination & Filtering
// ============================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============================================
// Dashboard / Analytics
// ============================================

export interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalCustomers: number;
  totalRevenue: number;
  averageBookingValue: number;
  popularServices: ServiceStats[];
  upcomingBookings: Booking[];
}

export interface ServiceStats {
  serviceId: string;
  serviceName: string;
  bookingCount: number;
  revenue: number;
}
