# Booklyfy API - Domain Models for .NET Clean Architecture Backend

This document describes all domain models/entities that should be created in the Domain Layer of the .NET Clean Architecture backend to support the Booklyfy booking platform.

## Table of Contents

1. [Overview](#overview)
2. [OperationResult Pattern](#operationresult-pattern)
3. [Domain Entities](#domain-entities)
4. [Value Objects](#value-objects)
5. [Request/Response DTOs](#requestresponse-dtos)
6. [API Endpoints](#api-endpoints)

---

## Overview

### Architecture Layers

```
├── Domain Layer
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Enums/
│   └── Common/
├── Application Layer
│   ├── DTOs/
│   ├── Interfaces/
│   ├── Features/
│   └── Common/
├── Infrastructure Layer
│   └── ...
└── Presentation Layer (API)
    └── ...
```

### Base Entity

All entities should inherit from a base entity class:

```csharp
namespace Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

---

## OperationResult Pattern

All API responses should use the `OperationResult<T>` pattern for consistent error handling:

```csharp
namespace Application.Common;

public class OperationResult<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public ApiError? Error { get; set; }
    public List<ValidationError> ValidationErrors { get; set; } = new();
    public int StatusCode { get; set; }
}

public class ApiError
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? StackTrace { get; set; } // Only in Development
}

public class ValidationError
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Code { get; set; }
}
```

### Error Codes

```csharp
namespace Domain.Common;

public static class ErrorCodes
{
    // General
    public const string UnknownError = "UNKNOWN_ERROR";
    public const string ValidationFailed = "VALIDATION_FAILED";
    public const string NotFound = "NOT_FOUND";
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string Conflict = "CONFLICT";
    public const string BadRequest = "BAD_REQUEST";
    public const string InternalServerError = "INTERNAL_SERVER_ERROR";

    // Authentication
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string EmailNotVerified = "EMAIL_NOT_VERIFIED";
    public const string AccountDisabled = "ACCOUNT_DISABLED";
    public const string TokenExpired = "TOKEN_EXPIRED";
    public const string InvalidToken = "INVALID_TOKEN";

    // User
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string EmailAlreadyExists = "EMAIL_ALREADY_EXISTS";
    public const string InvalidPassword = "INVALID_PASSWORD";

    // Business
    public const string BusinessNotFound = "BUSINESS_NOT_FOUND";
    public const string BusinessSlugExists = "BUSINESS_SLUG_EXISTS";
    public const string NotBusinessOwner = "NOT_BUSINESS_OWNER";

    // Staff
    public const string StaffNotFound = "STAFF_NOT_FOUND";
    public const string StaffAlreadyExists = "STAFF_ALREADY_EXISTS";
    public const string CannotRemoveOwner = "CANNOT_REMOVE_OWNER";

    // Service
    public const string ServiceNotFound = "SERVICE_NOT_FOUND";
    public const string ServiceCategoryNotFound = "SERVICE_CATEGORY_NOT_FOUND";

    // Booking
    public const string BookingNotFound = "BOOKING_NOT_FOUND";
    public const string SlotNotAvailable = "SLOT_NOT_AVAILABLE";
    public const string BookingAlreadyCancelled = "BOOKING_ALREADY_CANCELLED";
    public const string CannotCancelPastBooking = "CANNOT_CANCEL_PAST_BOOKING";
    public const string InvalidBookingTime = "INVALID_BOOKING_TIME";

    // Customer
    public const string CustomerNotFound = "CUSTOMER_NOT_FOUND";
    public const string CustomerEmailExists = "CUSTOMER_EMAIL_EXISTS";
}
```

---

## Domain Entities

### 1. User

```csharp
namespace Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsEmailVerified { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public ICollection<Staff> StaffMemberships { get; set; } = new List<Staff>();
    public ICollection<Business> OwnedBusinesses { get; set; } = new List<Business>();
}
```

### 2. Business

```csharp
namespace Domain.Entities;

public class Business : BaseEntity
{
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public BusinessType Type { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Website { get; set; }
    public string Country { get; set; } = string.Empty;
    public string Timezone { get; set; } = string.Empty;
    public Address? Address { get; set; }
    public bool IsActive { get; set; } = true;
    public string Slug { get; set; } = string.Empty;

    // Navigation properties
    public User Owner { get; set; } = null!;
    public ICollection<Staff> Staff { get; set; } = new List<Staff>();
    public ICollection<Service> Services { get; set; } = new List<Service>();
    public ICollection<ServiceCategory> ServiceCategories { get; set; } = new List<ServiceCategory>();
    public ICollection<Customer> Customers { get; set; } = new List<Customer>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public enum BusinessType
{
    HairSalon,
    BarberShop,
    SpaWellness,
    BeautyClinic,
    PersonalTraining,
    TherapyCoaching,
    Other
}
```

### 3. Staff

```csharp
namespace Domain.Entities;

public class Staff : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid BusinessId { get; set; }
    public StaffRole Role { get; set; }
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public User User { get; set; } = null!;
    public Business Business { get; set; } = null!;
    public ICollection<StaffService> StaffServices { get; set; } = new List<StaffService>();
    public ICollection<WorkingHours> WorkingHours { get; set; } = new List<WorkingHours>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public enum StaffRole
{
    Owner,
    Admin,
    Manager,
    Staff
}
```

### 4. Service

```csharp
namespace Domain.Entities;

public class Service : BaseEntity
{
    public Guid BusinessId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "SEK";
    public Guid? CategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int BufferTimeBefore { get; set; } = 0;
    public int BufferTimeAfter { get; set; } = 0;
    public int? MaxAdvanceBookingDays { get; set; }
    public int? MinAdvanceBookingHours { get; set; }

    // Navigation properties
    public Business Business { get; set; } = null!;
    public ServiceCategory? Category { get; set; }
    public ICollection<StaffService> StaffServices { get; set; } = new List<StaffService>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
```

### 5. ServiceCategory

```csharp
namespace Domain.Entities;

public class ServiceCategory : BaseEntity
{
    public Guid BusinessId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Business Business { get; set; } = null!;
    public ICollection<Service> Services { get; set; } = new List<Service>();
}
```

### 6. StaffService (Join Table)

```csharp
namespace Domain.Entities;

public class StaffService : BaseEntity
{
    public Guid StaffId { get; set; }
    public Guid ServiceId { get; set; }
    public decimal? CustomPrice { get; set; }
    public int? CustomDurationMinutes { get; set; }

    // Navigation properties
    public Staff Staff { get; set; } = null!;
    public Service Service { get; set; } = null!;
}
```

### 7. WorkingHours

```csharp
namespace Domain.Entities;

public class WorkingHours : BaseEntity
{
    public Guid StaffId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public bool IsEnabled { get; set; } = true;

    // Navigation properties
    public Staff Staff { get; set; } = null!;
}
```

### 8. Customer

```csharp
namespace Domain.Entities;

public class Customer : BaseEntity
{
    public Guid BusinessId { get; set; }
    public Guid? UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Notes { get; set; }
    public List<string> Tags { get; set; } = new();
    public int TotalBookings { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? LastVisitAt { get; set; }

    // Navigation properties
    public Business Business { get; set; } = null!;
    public User? User { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
```

### 9. Booking

```csharp
namespace Domain.Entities;

public class Booking : BaseEntity
{
    public Guid BusinessId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid StaffId { get; set; }
    public Guid ServiceId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelledBy { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "SEK";

    // Navigation properties
    public Business Business { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public Staff Staff { get; set; } = null!;
    public Service Service { get; set; } = null!;
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed,
    NoShow
}
```

### 10. NotificationSettings

```csharp
namespace Domain.Entities;

public class NotificationSettings : BaseEntity
{
    public Guid BusinessId { get; set; }
    public NotificationType Type { get; set; }
    public bool IsEmailEnabled { get; set; } = true;
    public bool IsSmsEnabled { get; set; } = false;
    public string? EmailTemplateId { get; set; }
    public string? SmsTemplateId { get; set; }
    public int? ReminderHoursBefore { get; set; }

    // Navigation properties
    public Business Business { get; set; } = null!;
}

public enum NotificationType
{
    BookingConfirmation,
    BookingReminder,
    BookingCancelled,
    BookingRescheduled
}
```

---

## Value Objects

### Address

```csharp
namespace Domain.ValueObjects;

public class Address
{
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? State { get; set; }
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
```

---

## Request/Response DTOs

### Authentication DTOs

```csharp
namespace Application.DTOs.Auth;

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    UserDto User,
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt
);

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName
);

public record RefreshTokenRequest(string RefreshToken);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Token, string NewPassword);
```

### Business DTOs

```csharp
namespace Application.DTOs.Business;

public record CreateBusinessRequest(
    string Name,
    BusinessType Type,
    string? Description,
    string Country,
    string Timezone,
    Address? Address
);

public record UpdateBusinessRequest(
    string? Name,
    BusinessType? Type,
    string? Description,
    string? LogoUrl,
    string? CoverImageUrl,
    string? Email,
    string? PhoneNumber,
    string? Website,
    string? Country,
    string? Timezone,
    Address? Address
);
```

### Staff DTOs

```csharp
namespace Application.DTOs.Staff;

public record CreateStaffRequest(
    string Email,
    string FirstName,
    string LastName,
    StaffRole Role,
    string? Title,
    string? Bio
);

public record UpdateStaffRequest(
    StaffRole? Role,
    string? Title,
    string? Bio,
    bool? IsActive
);
```

### Service DTOs

```csharp
namespace Application.DTOs.Service;

public record CreateServiceRequest(
    string Name,
    string? Description,
    int DurationMinutes,
    decimal Price,
    string Currency,
    Guid? CategoryId,
    int? BufferTimeBefore,
    int? BufferTimeAfter,
    int? MaxAdvanceBookingDays,
    int? MinAdvanceBookingHours
);

public record UpdateServiceRequest(
    string? Name,
    string? Description,
    int? DurationMinutes,
    decimal? Price,
    string? Currency,
    Guid? CategoryId,
    string? ImageUrl,
    bool? IsActive,
    int? BufferTimeBefore,
    int? BufferTimeAfter,
    int? MaxAdvanceBookingDays,
    int? MinAdvanceBookingHours
);
```

### Customer DTOs

```csharp
namespace Application.DTOs.Customer;

public record CreateCustomerRequest(
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string? Notes,
    List<string>? Tags
);

public record UpdateCustomerRequest(
    string? Email,
    string? FirstName,
    string? LastName,
    string? PhoneNumber,
    string? Notes,
    List<string>? Tags
);
```

### Booking DTOs

```csharp
namespace Application.DTOs.Booking;

public record CreateBookingRequest(
    Guid? CustomerId,
    Guid StaffId,
    Guid ServiceId,
    DateTime StartTime,
    string? Notes,
    // Guest booking fields
    string? CustomerEmail,
    string? CustomerFirstName,
    string? CustomerLastName,
    string? CustomerPhoneNumber
);

public record UpdateBookingRequest(
    Guid? StaffId,
    DateTime? StartTime,
    string? Notes
);

public record CancelBookingRequest(string? Reason);

public record AvailabilityRequest(
    Guid? StaffId,
    Guid ServiceId,
    DateOnly Date
);

public record AvailabilityResponse(
    DateOnly Date,
    List<TimeSlot> Slots
);

public record TimeSlot(
    DateTime StartTime,
    DateTime EndTime,
    bool IsAvailable
);
```

### Pagination DTOs

```csharp
namespace Application.DTOs.Common;

public record PaginationParams(
    int Page = 1,
    int PageSize = 10,
    string? SortBy = null,
    string SortDirection = "asc"
);

public record PaginatedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage
);
```

### Dashboard DTOs

```csharp
namespace Application.DTOs.Dashboard;

public record DashboardStats(
    int TodayBookings,
    int WeekBookings,
    int MonthBookings,
    int TotalCustomers,
    decimal TotalRevenue,
    decimal AverageBookingValue,
    List<ServiceStats> PopularServices,
    List<BookingDto> UpcomingBookings
);

public record ServiceStats(
    Guid ServiceId,
    string ServiceName,
    int BookingCount,
    decimal Revenue
);
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/verify-email` | Verify email address |

### Businesses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/businesses` | Get all businesses (admin) |
| GET | `/api/businesses/my` | Get current user's businesses |
| GET | `/api/businesses/{id}` | Get business by ID |
| GET | `/api/businesses/slug/{slug}` | Get business by slug |
| POST | `/api/businesses` | Create business |
| PUT | `/api/businesses/{id}` | Update business |
| DELETE | `/api/businesses/{id}` | Delete business |

### Staff

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/businesses/{businessId}/staff` | Get all staff |
| GET | `/api/businesses/{businessId}/staff/{staffId}` | Get staff member |
| POST | `/api/businesses/{businessId}/staff` | Add staff member |
| PUT | `/api/businesses/{businessId}/staff/{staffId}` | Update staff member |
| DELETE | `/api/businesses/{businessId}/staff/{staffId}` | Remove staff member |
| GET | `/api/businesses/{businessId}/staff/{staffId}/working-hours` | Get working hours |
| PUT | `/api/businesses/{businessId}/staff/{staffId}/working-hours` | Update working hours |

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/businesses/{businessId}/services` | Get all services |
| GET | `/api/businesses/{businessId}/services/{serviceId}` | Get service |
| POST | `/api/businesses/{businessId}/services` | Create service |
| PUT | `/api/businesses/{businessId}/services/{serviceId}` | Update service |
| DELETE | `/api/businesses/{businessId}/services/{serviceId}` | Delete service |
| GET | `/api/businesses/{businessId}/service-categories` | Get categories |
| POST | `/api/businesses/{businessId}/service-categories` | Create category |
| PUT | `/api/businesses/{businessId}/service-categories/{categoryId}` | Update category |
| DELETE | `/api/businesses/{businessId}/service-categories/{categoryId}` | Delete category |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/businesses/{businessId}/customers` | Get all customers |
| GET | `/api/businesses/{businessId}/customers/search?q={query}` | Search customers |
| GET | `/api/businesses/{businessId}/customers/{customerId}` | Get customer |
| POST | `/api/businesses/{businessId}/customers` | Create customer |
| PUT | `/api/businesses/{businessId}/customers/{customerId}` | Update customer |
| DELETE | `/api/businesses/{businessId}/customers/{customerId}` | Delete customer |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/businesses/{businessId}/bookings` | Get all bookings |
| GET | `/api/businesses/{businessId}/bookings/{bookingId}` | Get booking |
| POST | `/api/businesses/{businessId}/bookings` | Create booking |
| PUT | `/api/businesses/{businessId}/bookings/{bookingId}` | Update booking |
| POST | `/api/businesses/{businessId}/bookings/{bookingId}/cancel` | Cancel booking |
| PATCH | `/api/businesses/{businessId}/bookings/{bookingId}/confirm` | Confirm booking |
| PATCH | `/api/businesses/{businessId}/bookings/{bookingId}/complete` | Complete booking |
| PATCH | `/api/businesses/{businessId}/bookings/{bookingId}/no-show` | Mark as no-show |
| GET | `/api/businesses/{businessId}/availability` | Get availability slots |

### Reference Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reference/countries` | Get countries list |
| GET | `/api/reference/timezones` | Get timezones list |
| GET | `/api/reference/business-types` | Get business types |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/businesses/{businessId}/dashboard` | Get dashboard statistics |

---

## Environment Configuration

The frontend expects the following environment variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.booklyfy.com/api
VITE_USE_MOCK_DATA=false

# Other configuration...
```

When `VITE_USE_MOCK_DATA` is set to `true` (default in development), the frontend will use the built-in mock data instead of calling the real API.

---

## Notes

1. All endpoints require authentication except public booking endpoints
2. Business-scoped endpoints require authorization (user must be owner/admin/staff of the business)
3. All list endpoints support pagination via query parameters
4. Dates should be in ISO 8601 format
5. All monetary values use the smallest currency unit (e.g., cents/öre)
