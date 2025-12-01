import {
  User,
  Business,
  Staff,
  Service,
  ServiceCategory,
  Customer,
  Booking,
  WorkingHours,
  Country,
  Timezone,
  BusinessTypeOption,
  DashboardStats,
} from '@/types';

// ============================================
// Helper: Generate IDs and Dates
// ============================================

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

// ============================================
// Users
// ============================================

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.owner@example.com',
    firstName: 'John',
    lastName: 'Owner',
    phoneNumber: '+46701234567',
    profileImageUrl: undefined,
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: now,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  {
    id: 'user-2',
    email: 'sarah.stylist@example.com',
    firstName: 'Sarah',
    lastName: 'Stylist',
    phoneNumber: '+46702345678',
    profileImageUrl: undefined,
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: yesterday,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: yesterday,
  },
  {
    id: 'user-3',
    email: 'mike.barber@example.com',
    firstName: 'Mike',
    lastName: 'Barber',
    phoneNumber: '+46703456789',
    profileImageUrl: undefined,
    isEmailVerified: true,
    isActive: true,
    lastLoginAt: yesterday,
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: yesterday,
  },
];

export const mockCurrentUser = mockUsers[0];

// ============================================
// Businesses
// ============================================

export const mockBusinesses: Business[] = [
  {
    id: 'business-1',
    ownerId: 'user-1',
    name: 'Style Studio',
    type: 'hair_salon',
    description: 'Premium hair salon offering cutting, coloring, and styling services.',
    logoUrl: undefined,
    coverImageUrl: undefined,
    email: 'contact@stylestudio.com',
    phoneNumber: '+46101234567',
    website: 'https://stylestudio.com',
    country: 'SE',
    timezone: 'Europe/Stockholm',
    address: {
      street: 'Drottninggatan 50',
      city: 'Stockholm',
      postalCode: '111 21',
      country: 'SE',
      latitude: 59.3293,
      longitude: 18.0686,
    },
    isActive: true,
    slug: 'style-studio',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
];

export const mockCurrentBusiness = mockBusinesses[0];

// ============================================
// Staff
// ============================================

export const mockStaff: Staff[] = [
  {
    id: 'staff-1',
    userId: 'user-1',
    businessId: 'business-1',
    role: 'owner',
    title: 'Owner & Senior Stylist',
    bio: '15 years of experience in hair styling and salon management.',
    profileImageUrl: undefined,
    isActive: true,
    user: mockUsers[0],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  {
    id: 'staff-2',
    userId: 'user-2',
    businessId: 'business-1',
    role: 'staff',
    title: 'Senior Stylist',
    bio: 'Specializing in color treatments and modern cuts.',
    profileImageUrl: undefined,
    isActive: true,
    user: mockUsers[1],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: yesterday,
  },
  {
    id: 'staff-3',
    userId: 'user-3',
    businessId: 'business-1',
    role: 'staff',
    title: 'Barber',
    bio: 'Expert in classic and modern men\'s cuts and beard styling.',
    profileImageUrl: undefined,
    isActive: true,
    user: mockUsers[2],
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: yesterday,
  },
];

// ============================================
// Service Categories
// ============================================

export const mockServiceCategories: ServiceCategory[] = [
  {
    id: 'category-1',
    businessId: 'business-1',
    name: 'Haircuts',
    description: 'All types of haircuts',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  {
    id: 'category-2',
    businessId: 'business-1',
    name: 'Coloring',
    description: 'Hair coloring and highlights',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  {
    id: 'category-3',
    businessId: 'business-1',
    name: 'Treatments',
    description: 'Hair treatments and care',
    sortOrder: 3,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  {
    id: 'category-4',
    businessId: 'business-1',
    name: 'Beard & Grooming',
    description: 'Beard trimming and grooming services',
    sortOrder: 4,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
];

// ============================================
// Services
// ============================================

export const mockServices: Service[] = [
  // Haircuts
  {
    id: 'service-1',
    businessId: 'business-1',
    name: 'Women\'s Haircut',
    description: 'Includes consultation, wash, cut, and styling.',
    durationMinutes: 60,
    price: 550,
    currency: 'SEK',
    categoryId: 'category-1',
    imageUrl: undefined,
    isActive: true,
    bufferTimeBefore: 0,
    bufferTimeAfter: 10,
    maxAdvanceBookingDays: 60,
    minAdvanceBookingHours: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  {
    id: 'service-2',
    businessId: 'business-1',
    name: 'Men\'s Haircut',
    description: 'Classic or modern cut with wash and styling.',
    durationMinutes: 30,
    price: 350,
    currency: 'SEK',
    categoryId: 'category-1',
    imageUrl: undefined,
    isActive: true,
    bufferTimeBefore: 0,
    bufferTimeAfter: 5,
    maxAdvanceBookingDays: 60,
    minAdvanceBookingHours: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  {
    id: 'service-3',
    businessId: 'business-1',
    name: 'Children\'s Haircut',
    description: 'Haircut for children under 12.',
    durationMinutes: 30,
    price: 250,
    currency: 'SEK',
    categoryId: 'category-1',
    imageUrl: undefined,
    isActive: true,
    bufferTimeBefore: 0,
    bufferTimeAfter: 5,
    maxAdvanceBookingDays: 60,
    minAdvanceBookingHours: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  // Coloring
  {
    id: 'service-4',
    businessId: 'business-1',
    name: 'Full Color',
    description: 'Complete hair coloring with premium products.',
    durationMinutes: 120,
    price: 1200,
    currency: 'SEK',
    categoryId: 'category-2',
    imageUrl: undefined,
    isActive: true,
    bufferTimeBefore: 0,
    bufferTimeAfter: 15,
    maxAdvanceBookingDays: 60,
    minAdvanceBookingHours: 24,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  {
    id: 'service-5',
    businessId: 'business-1',
    name: 'Highlights',
    description: 'Partial or full highlights.',
    durationMinutes: 150,
    price: 1500,
    currency: 'SEK',
    categoryId: 'category-2',
    imageUrl: undefined,
    isActive: true,
    bufferTimeBefore: 0,
    bufferTimeAfter: 15,
    maxAdvanceBookingDays: 60,
    minAdvanceBookingHours: 24,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  // Treatments
  {
    id: 'service-6',
    businessId: 'business-1',
    name: 'Deep Conditioning Treatment',
    description: 'Intensive moisturizing treatment for damaged hair.',
    durationMinutes: 45,
    price: 450,
    currency: 'SEK',
    categoryId: 'category-3',
    imageUrl: undefined,
    isActive: true,
    bufferTimeBefore: 0,
    bufferTimeAfter: 5,
    maxAdvanceBookingDays: 60,
    minAdvanceBookingHours: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  // Beard & Grooming
  {
    id: 'service-7',
    businessId: 'business-1',
    name: 'Beard Trim',
    description: 'Professional beard shaping and trimming.',
    durationMinutes: 20,
    price: 200,
    currency: 'SEK',
    categoryId: 'category-4',
    imageUrl: undefined,
    isActive: true,
    bufferTimeBefore: 0,
    bufferTimeAfter: 5,
    maxAdvanceBookingDays: 60,
    minAdvanceBookingHours: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
  {
    id: 'service-8',
    businessId: 'business-1',
    name: 'Hot Towel Shave',
    description: 'Classic hot towel straight razor shave.',
    durationMinutes: 30,
    price: 350,
    currency: 'SEK',
    categoryId: 'category-4',
    imageUrl: undefined,
    isActive: true,
    bufferTimeBefore: 0,
    bufferTimeAfter: 10,
    maxAdvanceBookingDays: 60,
    minAdvanceBookingHours: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  },
];

// ============================================
// Customers
// ============================================

export const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    businessId: 'business-1',
    userId: undefined,
    email: 'anna.svensson@email.com',
    firstName: 'Anna',
    lastName: 'Svensson',
    phoneNumber: '+46761234567',
    notes: 'Prefers afternoon appointments',
    tags: ['regular', 'color-client'],
    totalBookings: 12,
    totalSpent: 8500,
    lastVisitAt: yesterday,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: yesterday,
  },
  {
    id: 'customer-2',
    businessId: 'business-1',
    userId: undefined,
    email: 'erik.lindberg@email.com',
    firstName: 'Erik',
    lastName: 'Lindberg',
    phoneNumber: '+46762345678',
    notes: undefined,
    tags: ['regular'],
    totalBookings: 8,
    totalSpent: 2800,
    lastVisitAt: yesterday,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: yesterday,
  },
  {
    id: 'customer-3',
    businessId: 'business-1',
    userId: undefined,
    email: 'maria.johansson@email.com',
    firstName: 'Maria',
    lastName: 'Johansson',
    phoneNumber: '+46763456789',
    notes: 'Sensitive scalp - use gentle products',
    tags: ['vip', 'regular'],
    totalBookings: 24,
    totalSpent: 18500,
    lastVisitAt: yesterday,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: yesterday,
  },
  {
    id: 'customer-4',
    businessId: 'business-1',
    userId: undefined,
    email: 'karl.nilsson@email.com',
    firstName: 'Karl',
    lastName: 'Nilsson',
    phoneNumber: '+46764567890',
    notes: undefined,
    tags: [],
    totalBookings: 3,
    totalSpent: 1050,
    lastVisitAt: '2024-10-15T10:00:00Z',
    createdAt: '2024-09-01T10:00:00Z',
    updatedAt: '2024-10-15T10:00:00Z',
  },
  {
    id: 'customer-5',
    businessId: 'business-1',
    userId: undefined,
    email: 'lisa.berg@email.com',
    firstName: 'Lisa',
    lastName: 'Berg',
    phoneNumber: '+46765678901',
    notes: 'New customer - referred by Maria',
    tags: ['new'],
    totalBookings: 1,
    totalSpent: 550,
    lastVisitAt: yesterday,
    createdAt: yesterday,
    updatedAt: yesterday,
  },
];

// ============================================
// Bookings
// ============================================

// Helper to create booking times
function createBookingTime(daysFromNow: number, hour: number, durationMinutes: number): { startTime: string; endTime: string } {
  const start = new Date();
  start.setDate(start.getDate() + daysFromNow);
  start.setHours(hour, 0, 0, 0);

  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };
}

export const mockBookings: Booking[] = [
  // Today's bookings
  {
    id: 'booking-1',
    businessId: 'business-1',
    customerId: 'customer-1',
    staffId: 'staff-2',
    serviceId: 'service-1',
    ...createBookingTime(0, 10, 60),
    status: 'confirmed',
    notes: undefined,
    price: 550,
    currency: 'SEK',
    customer: mockCustomers[0],
    staff: mockStaff[1],
    service: mockServices[0],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: 'booking-2',
    businessId: 'business-1',
    customerId: 'customer-2',
    staffId: 'staff-3',
    serviceId: 'service-2',
    ...createBookingTime(0, 11, 30),
    status: 'confirmed',
    notes: 'Regular style',
    price: 350,
    currency: 'SEK',
    customer: mockCustomers[1],
    staff: mockStaff[2],
    service: mockServices[1],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: 'booking-3',
    businessId: 'business-1',
    customerId: 'customer-3',
    staffId: 'staff-2',
    serviceId: 'service-4',
    ...createBookingTime(0, 14, 120),
    status: 'confirmed',
    notes: 'Going darker this time',
    price: 1200,
    currency: 'SEK',
    customer: mockCustomers[2],
    staff: mockStaff[1],
    service: mockServices[3],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  // Tomorrow's bookings
  {
    id: 'booking-4',
    businessId: 'business-1',
    customerId: 'customer-5',
    staffId: 'staff-1',
    serviceId: 'service-1',
    ...createBookingTime(1, 9, 60),
    status: 'confirmed',
    notes: 'First visit',
    price: 550,
    currency: 'SEK',
    customer: mockCustomers[4],
    staff: mockStaff[0],
    service: mockServices[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'booking-5',
    businessId: 'business-1',
    customerId: 'customer-4',
    staffId: 'staff-3',
    serviceId: 'service-7',
    ...createBookingTime(1, 10, 20),
    status: 'pending',
    notes: undefined,
    price: 200,
    currency: 'SEK',
    customer: mockCustomers[3],
    staff: mockStaff[2],
    service: mockServices[6],
    createdAt: now,
    updatedAt: now,
  },
  // Past bookings
  {
    id: 'booking-6',
    businessId: 'business-1',
    customerId: 'customer-1',
    staffId: 'staff-2',
    serviceId: 'service-5',
    ...createBookingTime(-7, 11, 150),
    status: 'completed',
    notes: undefined,
    price: 1500,
    currency: 'SEK',
    customer: mockCustomers[0],
    staff: mockStaff[1],
    service: mockServices[4],
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-11-24T13:30:00Z',
  },
  {
    id: 'booking-7',
    businessId: 'business-1',
    customerId: 'customer-2',
    staffId: 'staff-3',
    serviceId: 'service-2',
    ...createBookingTime(-3, 15, 30),
    status: 'completed',
    notes: undefined,
    price: 350,
    currency: 'SEK',
    customer: mockCustomers[1],
    staff: mockStaff[2],
    service: mockServices[1],
    createdAt: '2024-11-25T10:00:00Z',
    updatedAt: '2024-11-28T15:30:00Z',
  },
  // Cancelled booking
  {
    id: 'booking-8',
    businessId: 'business-1',
    customerId: 'customer-4',
    staffId: 'staff-1',
    serviceId: 'service-1',
    ...createBookingTime(-1, 10, 60),
    status: 'cancelled',
    notes: undefined,
    cancellationReason: 'Customer requested cancellation',
    cancelledAt: '2024-11-29T08:00:00Z',
    cancelledBy: 'customer',
    price: 550,
    currency: 'SEK',
    customer: mockCustomers[3],
    staff: mockStaff[0],
    service: mockServices[0],
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-11-29T08:00:00Z',
  },
];

// ============================================
// Working Hours
// ============================================

function createWorkingHoursForStaff(staffId: string): WorkingHours[] {
  const hours: WorkingHours[] = [];
  // Monday to Friday: 9:00 - 18:00
  for (let day = 1; day <= 5; day++) {
    hours.push({
      id: `wh-${staffId}-${day}`,
      staffId,
      dayOfWeek: day as 1 | 2 | 3 | 4 | 5,
      startTime: '09:00',
      endTime: '18:00',
      isEnabled: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: now,
    });
  }
  // Saturday: 10:00 - 16:00
  hours.push({
    id: `wh-${staffId}-6`,
    staffId,
    dayOfWeek: 6,
    startTime: '10:00',
    endTime: '16:00',
    isEnabled: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  });
  // Sunday: closed
  hours.push({
    id: `wh-${staffId}-0`,
    staffId,
    dayOfWeek: 0,
    startTime: '00:00',
    endTime: '00:00',
    isEnabled: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: now,
  });
  return hours;
}

export const mockWorkingHours: WorkingHours[] = [
  ...createWorkingHoursForStaff('staff-1'),
  ...createWorkingHoursForStaff('staff-2'),
  ...createWorkingHoursForStaff('staff-3'),
];

// ============================================
// Reference Data
// ============================================

export const mockCountries: Country[] = [
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'DE', name: 'Germany' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

export const mockTimezones: Timezone[] = [
  { id: 'Europe/Stockholm', name: 'Stockholm (CET)', offset: '+01:00' },
  { id: 'Europe/Oslo', name: 'Oslo (CET)', offset: '+01:00' },
  { id: 'Europe/Copenhagen', name: 'Copenhagen (CET)', offset: '+01:00' },
  { id: 'Europe/Helsinki', name: 'Helsinki (EET)', offset: '+02:00' },
  { id: 'Europe/Berlin', name: 'Berlin (CET)', offset: '+01:00' },
  { id: 'Europe/Amsterdam', name: 'Amsterdam (CET)', offset: '+01:00' },
  { id: 'Europe/London', name: 'London (GMT)', offset: '+00:00' },
  { id: 'America/New_York', name: 'New York (EST)', offset: '-05:00' },
  { id: 'America/Los_Angeles', name: 'Los Angeles (PST)', offset: '-08:00' },
];

export const mockBusinessTypes: BusinessTypeOption[] = [
  { value: 'hair_salon', label: 'Hair Salon' },
  { value: 'barber_shop', label: 'Barber Shop' },
  { value: 'spa_wellness', label: 'Spa & Wellness' },
  { value: 'beauty_clinic', label: 'Beauty Clinic' },
  { value: 'personal_training', label: 'Personal Training' },
  { value: 'therapy_coaching', label: 'Therapy & Coaching' },
  { value: 'other', label: 'Other' },
];

// ============================================
// Dashboard Stats
// ============================================

export const mockDashboardStats: DashboardStats = {
  todayBookings: 3,
  weekBookings: 12,
  monthBookings: 48,
  totalCustomers: mockCustomers.length,
  totalRevenue: 45000,
  averageBookingValue: 625,
  popularServices: [
    { serviceId: 'service-1', serviceName: "Women's Haircut", bookingCount: 15, revenue: 8250 },
    { serviceId: 'service-2', serviceName: "Men's Haircut", bookingCount: 12, revenue: 4200 },
    { serviceId: 'service-4', serviceName: 'Full Color', bookingCount: 8, revenue: 9600 },
    { serviceId: 'service-5', serviceName: 'Highlights', bookingCount: 6, revenue: 9000 },
  ],
  upcomingBookings: mockBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').slice(0, 5),
};
