// ============================================
// API Services Index
// ============================================

// API Client
export {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  isAuthenticated,
  isMockMode,
  getApiBaseUrl,
} from './api-client';

// Auth Service
export {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from './auth.service';

// Business Service
export {
  getAllBusinesses,
  getBusinessById,
  getBusinessBySlug,
  getMyBusinesses,
  getCurrentBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from './business.service';

// Staff Service
export {
  getAllStaff,
  getStaffList,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffWorkingHours,
  updateStaffWorkingHours,
} from './staff.service';

// Service Service
export {
  getAllServices,
  getServiceList,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './service.service';

// Customer Service
export {
  getAllCustomers,
  getCustomerById,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from './customer.service';

// Booking Service
export {
  getAllBookings,
  getBookingById,
  getAvailability,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  completeBooking,
  markBookingNoShow,
  deleteBooking,
  getTodayBookings,
  getUpcomingBookings,
} from './booking.service';

// Reference Data Service
export {
  getCountries,
  getTimezones,
  getBusinessTypes,
  getDashboardStats,
} from './reference-data.service';

// Mock Data (for testing/development)
export * from './mock-data';
