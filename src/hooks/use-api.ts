import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { OperationResult, isSuccessResult } from '@/types/api';
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
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  CreateStaffRequest,
  UpdateStaffRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreateBookingRequest,
  UpdateBookingRequest,
  CancelBookingRequest,
  AvailabilityRequest,
  AvailabilityResponse,
  PaginatedResult,
  PaginationParams,
  BookingStatus,
} from '@/types';
import * as api from '@/services';

// ============================================
// Query Keys
// ============================================

export const queryKeys = {
  // Auth
  currentUser: ['currentUser'] as const,

  // Business
  businesses: ['businesses'] as const,
  business: (id: string) => ['businesses', id] as const,
  businessBySlug: (slug: string) => ['businesses', 'slug', slug] as const,
  myBusinesses: ['myBusinesses'] as const,

  // Staff
  staff: (businessId: string) => ['businesses', businessId, 'staff'] as const,
  staffMember: (businessId: string, staffId: string) => ['businesses', businessId, 'staff', staffId] as const,
  workingHours: (businessId: string, staffId: string) => ['businesses', businessId, 'staff', staffId, 'workingHours'] as const,

  // Services
  services: (businessId: string) => ['businesses', businessId, 'services'] as const,
  service: (businessId: string, serviceId: string) => ['businesses', businessId, 'services', serviceId] as const,
  categories: (businessId: string) => ['businesses', businessId, 'categories'] as const,

  // Customers
  customers: (businessId: string) => ['businesses', businessId, 'customers'] as const,
  customer: (businessId: string, customerId: string) => ['businesses', businessId, 'customers', customerId] as const,

  // Bookings
  bookings: (businessId: string) => ['businesses', businessId, 'bookings'] as const,
  booking: (businessId: string, bookingId: string) => ['businesses', businessId, 'bookings', bookingId] as const,
  availability: (businessId: string) => ['businesses', businessId, 'availability'] as const,

  // Reference Data
  countries: ['countries'] as const,
  timezones: ['timezones'] as const,
  businessTypes: ['businessTypes'] as const,
  dashboard: (businessId: string) => ['businesses', businessId, 'dashboard'] as const,
} as const;

// ============================================
// Auth Hooks
// ============================================

export function useCurrentUser(
  options?: Omit<UseQueryOptions<OperationResult<User>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => api.getCurrentUser(),
    ...options,
  });
}

export function useLogin(
  options?: UseMutationOptions<OperationResult<LoginResponse>, Error, LoginRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LoginRequest) => api.login(request),
    onSuccess: (result) => {
      if (isSuccessResult(result)) {
        queryClient.setQueryData(queryKeys.currentUser, { isSuccess: true, data: result.data.user });
      }
    },
    ...options,
  });
}

export function useRegister(
  options?: UseMutationOptions<OperationResult<User>, Error, RegisterRequest>
) {
  return useMutation({
    mutationFn: (request: RegisterRequest) => api.register(request),
    ...options,
  });
}

export function useLogout(
  options?: UseMutationOptions<OperationResult<null>, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
    ...options,
  });
}

// ============================================
// Business Hooks
// ============================================

export function useBusinesses(
  params?: PaginationParams,
  options?: Omit<UseQueryOptions<OperationResult<PaginatedResult<Business>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKeys.businesses, params],
    queryFn: () => api.getAllBusinesses(params),
    ...options,
  });
}

export function useBusiness(
  id: string,
  options?: Omit<UseQueryOptions<OperationResult<Business>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.business(id),
    queryFn: () => api.getBusinessById(id),
    enabled: !!id,
    ...options,
  });
}

export function useMyBusinesses(
  options?: Omit<UseQueryOptions<OperationResult<Business[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.myBusinesses,
    queryFn: () => api.getMyBusinesses(),
    ...options,
  });
}

export function useCreateBusiness(
  options?: UseMutationOptions<OperationResult<Business>, Error, CreateBusinessRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBusinessRequest) => api.createBusiness(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses });
      queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
    },
    ...options,
  });
}

export function useUpdateBusiness(
  options?: UseMutationOptions<OperationResult<Business>, Error, { id: string; data: UpdateBusinessRequest }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.updateBusiness(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses });
    },
    ...options,
  });
}

// ============================================
// Staff Hooks
// ============================================

export function useStaff(
  businessId: string,
  params?: PaginationParams,
  options?: Omit<UseQueryOptions<OperationResult<PaginatedResult<Staff>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKeys.staff(businessId), params],
    queryFn: () => api.getAllStaff(businessId, params),
    enabled: !!businessId,
    ...options,
  });
}

export function useStaffList(
  businessId: string,
  options?: Omit<UseQueryOptions<OperationResult<Staff[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.staff(businessId),
    queryFn: () => api.getStaffList(businessId),
    enabled: !!businessId,
    ...options,
  });
}

export function useStaffMember(
  businessId: string,
  staffId: string,
  options?: Omit<UseQueryOptions<OperationResult<Staff>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.staffMember(businessId, staffId),
    queryFn: () => api.getStaffById(businessId, staffId),
    enabled: !!businessId && !!staffId,
    ...options,
  });
}

export function useCreateStaff(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Staff>, Error, CreateStaffRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateStaffRequest) => api.createStaff(businessId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff(businessId) });
    },
    ...options,
  });
}

export function useUpdateStaff(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Staff>, Error, { staffId: string; data: UpdateStaffRequest }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }) => api.updateStaff(businessId, staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staffMember(businessId, variables.staffId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff(businessId) });
    },
    ...options,
  });
}

export function useWorkingHours(
  businessId: string,
  staffId: string,
  options?: Omit<UseQueryOptions<OperationResult<WorkingHours[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.workingHours(businessId, staffId),
    queryFn: () => api.getStaffWorkingHours(businessId, staffId),
    enabled: !!businessId && !!staffId,
    ...options,
  });
}

// ============================================
// Service Hooks
// ============================================

export function useServices(
  businessId: string,
  params?: PaginationParams & { categoryId?: string },
  options?: Omit<UseQueryOptions<OperationResult<PaginatedResult<Service>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKeys.services(businessId), params],
    queryFn: () => api.getAllServices(businessId, params),
    enabled: !!businessId,
    ...options,
  });
}

export function useServiceList(
  businessId: string,
  options?: Omit<UseQueryOptions<OperationResult<Service[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.services(businessId),
    queryFn: () => api.getServiceList(businessId),
    enabled: !!businessId,
    ...options,
  });
}

export function useService(
  businessId: string,
  serviceId: string,
  options?: Omit<UseQueryOptions<OperationResult<Service>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.service(businessId, serviceId),
    queryFn: () => api.getServiceById(businessId, serviceId),
    enabled: !!businessId && !!serviceId,
    ...options,
  });
}

export function useCategories(
  businessId: string,
  options?: Omit<UseQueryOptions<OperationResult<ServiceCategory[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.categories(businessId),
    queryFn: () => api.getAllCategories(businessId),
    enabled: !!businessId,
    ...options,
  });
}

export function useCreateService(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Service>, Error, CreateServiceRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateServiceRequest) => api.createService(businessId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services(businessId) });
    },
    ...options,
  });
}

export function useUpdateService(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Service>, Error, { serviceId: string; data: UpdateServiceRequest }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }) => api.updateService(businessId, serviceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.service(businessId, variables.serviceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.services(businessId) });
    },
    ...options,
  });
}

// ============================================
// Customer Hooks
// ============================================

export function useCustomers(
  businessId: string,
  params?: PaginationParams & { search?: string; tags?: string[] },
  options?: Omit<UseQueryOptions<OperationResult<PaginatedResult<Customer>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKeys.customers(businessId), params],
    queryFn: () => api.getAllCustomers(businessId, params),
    enabled: !!businessId,
    ...options,
  });
}

export function useCustomer(
  businessId: string,
  customerId: string,
  options?: Omit<UseQueryOptions<OperationResult<Customer>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.customer(businessId, customerId),
    queryFn: () => api.getCustomerById(businessId, customerId),
    enabled: !!businessId && !!customerId,
    ...options,
  });
}

export function useSearchCustomers(
  businessId: string,
  query: string,
  options?: Omit<UseQueryOptions<OperationResult<Customer[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKeys.customers(businessId), 'search', query],
    queryFn: () => api.searchCustomers(businessId, query),
    enabled: !!businessId && query.length >= 2,
    ...options,
  });
}

export function useCreateCustomer(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Customer>, Error, CreateCustomerRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCustomerRequest) => api.createCustomer(businessId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers(businessId) });
    },
    ...options,
  });
}

export function useUpdateCustomer(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Customer>, Error, { customerId: string; data: UpdateCustomerRequest }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, data }) => api.updateCustomer(businessId, customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer(businessId, variables.customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers(businessId) });
    },
    ...options,
  });
}

// ============================================
// Booking Hooks
// ============================================

export function useBookings(
  businessId: string,
  params?: PaginationParams & {
    status?: BookingStatus;
    staffId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  },
  options?: Omit<UseQueryOptions<OperationResult<PaginatedResult<Booking>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKeys.bookings(businessId), params],
    queryFn: () => api.getAllBookings(businessId, params),
    enabled: !!businessId,
    ...options,
  });
}

export function useBooking(
  businessId: string,
  bookingId: string,
  options?: Omit<UseQueryOptions<OperationResult<Booking>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.booking(businessId, bookingId),
    queryFn: () => api.getBookingById(businessId, bookingId),
    enabled: !!businessId && !!bookingId,
    ...options,
  });
}

export function useAvailability(
  businessId: string,
  request: AvailabilityRequest,
  options?: Omit<UseQueryOptions<OperationResult<AvailabilityResponse>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKeys.availability(businessId), request],
    queryFn: () => api.getAvailability(businessId, request),
    enabled: !!businessId && !!request.serviceId && !!request.date,
    ...options,
  });
}

export function useCreateBooking(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Booking>, Error, CreateBookingRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBookingRequest) => api.createBooking(businessId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings(businessId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.availability(businessId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(businessId) });
    },
    ...options,
  });
}

export function useUpdateBooking(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Booking>, Error, { bookingId: string; data: UpdateBookingRequest }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, data }) => api.updateBooking(businessId, bookingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(businessId, variables.bookingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings(businessId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.availability(businessId) });
    },
    ...options,
  });
}

export function useCancelBooking(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Booking>, Error, { bookingId: string; reason?: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, reason }) => api.cancelBooking(businessId, bookingId, reason ? { reason } : undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(businessId, variables.bookingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings(businessId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.availability(businessId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(businessId) });
    },
    ...options,
  });
}

export function useConfirmBooking(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Booking>, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => api.confirmBooking(businessId, bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(businessId, bookingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings(businessId) });
    },
    ...options,
  });
}

export function useCompleteBooking(
  businessId: string,
  options?: UseMutationOptions<OperationResult<Booking>, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => api.completeBooking(businessId, bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(businessId, bookingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings(businessId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(businessId) });
    },
    ...options,
  });
}

// ============================================
// Reference Data Hooks
// ============================================

export function useCountries(
  options?: Omit<UseQueryOptions<OperationResult<Country[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.countries,
    queryFn: () => api.getCountries(),
    staleTime: Infinity, // Reference data rarely changes
    ...options,
  });
}

export function useTimezones(
  options?: Omit<UseQueryOptions<OperationResult<Timezone[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.timezones,
    queryFn: () => api.getTimezones(),
    staleTime: Infinity,
    ...options,
  });
}

export function useBusinessTypes(
  options?: Omit<UseQueryOptions<OperationResult<BusinessTypeOption[]>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.businessTypes,
    queryFn: () => api.getBusinessTypes(),
    staleTime: Infinity,
    ...options,
  });
}

export function useDashboard(
  businessId: string,
  options?: Omit<UseQueryOptions<OperationResult<DashboardStats>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dashboard(businessId),
    queryFn: () => api.getDashboardStats(businessId),
    enabled: !!businessId,
    refetchInterval: 60000, // Refresh every minute
    ...options,
  });
}
