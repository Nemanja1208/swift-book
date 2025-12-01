# API Endpoints Reference

Complete reference for all API endpoints the Booklyfy frontend expects from your .NET backend.

---

## Base URL

All endpoints are prefixed with your API base URL:
```
http://localhost:5000/api
```

---

## Response Format

**Every** endpoint must return an `OperationResult<T>`:

```json
{
  "isSuccess": boolean,
  "data": T | null,
  "error": { "code": string, "message": string } | null,
  "validationErrors": [],
  "statusCode": number
}
```

---

## Authentication Endpoints

### POST /auth/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "isSuccess": true,
  "data": {
    "user": {
      "id": "guid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": null,
      "profileImageUrl": null,
      "isEmailVerified": true,
      "isActive": true,
      "lastLoginAt": "2024-01-01T10:00:00Z",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh-token-here",
    "expiresAt": "2024-01-02T10:00:00Z"
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

**Error (401):**
```json
{
  "isSuccess": false,
  "data": null,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "validationErrors": [],
  "statusCode": 401
}
```

---

### POST /auth/register

Create a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response (201):**
```json
{
  "isSuccess": true,
  "data": {
    "id": "new-user-guid",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "isEmailVerified": false,
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 201
}
```

**Error (409 - Email exists):**
```json
{
  "isSuccess": false,
  "data": null,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "A user with this email already exists"
  },
  "validationErrors": [],
  "statusCode": 409
}
```

---

### POST /auth/me

Get the currently authenticated user. Requires `Authorization: Bearer {token}` header.

**Request:** Empty body

**Response (200):**
```json
{
  "isSuccess": true,
  "data": {
    "id": "user-guid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isEmailVerified": true,
    "isActive": true
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

### POST /auth/logout

Logout and invalidate tokens.

**Response (200):**
```json
{
  "isSuccess": true,
  "data": null,
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

### POST /auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "current-refresh-token"
}
```

**Response (200):**
```json
{
  "isSuccess": true,
  "data": {
    "user": { ... },
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token",
    "expiresAt": "2024-01-02T10:00:00Z"
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

### POST /auth/forgot-password

Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):** Always returns success (don't reveal if email exists)
```json
{
  "isSuccess": true,
  "data": null,
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

### POST /auth/reset-password

Reset password with token from email.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

---

### POST /auth/verify-email

Verify email address with token.

**Request:**
```json
{
  "token": "verification-token-from-email"
}
```

---

## Business Endpoints

### GET /businesses/my

Get all businesses owned by the current user.

**Response (200):**
```json
{
  "isSuccess": true,
  "data": [
    {
      "id": "business-guid",
      "ownerId": "user-guid",
      "name": "John's Barber Shop",
      "type": "barber_shop",
      "description": "Premium barber services",
      "logoUrl": null,
      "email": "shop@example.com",
      "phoneNumber": "+1234567890",
      "country": "SE",
      "timezone": "Europe/Stockholm",
      "address": {
        "street": "123 Main St",
        "city": "Stockholm",
        "postalCode": "12345",
        "country": "SE"
      },
      "isActive": true,
      "slug": "johns-barber-shop",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

### POST /businesses

Create a new business.

**Request:**
```json
{
  "name": "My Salon",
  "type": "hair_salon",
  "description": "Best hair salon in town",
  "country": "SE",
  "timezone": "Europe/Stockholm",
  "address": {
    "street": "456 Oak Ave",
    "city": "Stockholm",
    "postalCode": "12345",
    "country": "SE"
  }
}
```

**Business Types (enum):**
- `hair_salon`
- `barber_shop`
- `spa_wellness`
- `beauty_clinic`
- `personal_training`
- `therapy_coaching`
- `other`

---

### GET /businesses/{id}

Get business by ID.

---

### GET /businesses/slug/{slug}

Get business by URL slug.

---

### PUT /businesses/{id}

Update business details.

---

### DELETE /businesses/{id}

Delete a business.

---

## Staff Endpoints

### GET /businesses/{businessId}/staff

Get all staff members for a business.

**Response (200):**
```json
{
  "isSuccess": true,
  "data": [
    {
      "id": "staff-guid",
      "userId": "user-guid",
      "businessId": "business-guid",
      "role": "owner",
      "title": "Master Barber",
      "bio": "10 years of experience",
      "profileImageUrl": null,
      "isActive": true,
      "user": {
        "id": "user-guid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    }
  ],
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

**Staff Roles (enum):**
- `owner`
- `admin`
- `manager`
- `staff`

---

### POST /businesses/{businessId}/staff

Add a new staff member.

**Request:**
```json
{
  "email": "staff@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "staff",
  "title": "Hair Stylist"
}
```

---

### GET /businesses/{businessId}/staff/{staffId}/working-hours

Get staff working hours.

**Response (200):**
```json
{
  "isSuccess": true,
  "data": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isEnabled": true
    },
    {
      "dayOfWeek": 2,
      "startTime": "09:00",
      "endTime": "17:00",
      "isEnabled": true
    }
  ],
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

## Service Endpoints

### GET /businesses/{businessId}/services

Get all services for a business.

**Response (200):**
```json
{
  "isSuccess": true,
  "data": [
    {
      "id": "service-guid",
      "businessId": "business-guid",
      "name": "Haircut",
      "description": "Classic haircut with styling",
      "durationMinutes": 30,
      "price": 350,
      "currency": "SEK",
      "categoryId": null,
      "imageUrl": null,
      "isActive": true,
      "bufferTimeBefore": 0,
      "bufferTimeAfter": 5,
      "maxAdvanceBookingDays": 30,
      "minAdvanceBookingHours": 2
    }
  ],
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

### POST /businesses/{businessId}/services

Create a new service.

**Request:**
```json
{
  "name": "Premium Haircut",
  "description": "Includes wash and styling",
  "durationMinutes": 45,
  "price": 500,
  "currency": "SEK",
  "categoryId": null,
  "bufferTimeBefore": 0,
  "bufferTimeAfter": 10
}
```

---

## Customer Endpoints

### GET /businesses/{businessId}/customers

Get all customers with pagination.

**Query Parameters:**
- `page` (default: 1)
- `pageSize` (default: 10)
- `sortBy` (optional)
- `sortDirection` (asc/desc)

**Response (200):**
```json
{
  "isSuccess": true,
  "data": {
    "items": [
      {
        "id": "customer-guid",
        "businessId": "business-guid",
        "email": "customer@example.com",
        "firstName": "Alice",
        "lastName": "Johnson",
        "phoneNumber": "+1234567890",
        "notes": "Prefers morning appointments",
        "tags": ["VIP", "Regular"],
        "totalBookings": 15,
        "totalSpent": 5250,
        "lastVisitAt": "2024-01-01T10:00:00Z"
      }
    ],
    "totalCount": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

### GET /businesses/{businessId}/customers/search

Search customers by query string.

**Query Parameters:**
- `q` - Search query (searches name, email, phone)

---

### POST /businesses/{businessId}/customers

Create a new customer.

**Request:**
```json
{
  "email": "newcustomer@example.com",
  "firstName": "Bob",
  "lastName": "Williams",
  "phoneNumber": "+1234567890",
  "notes": "New customer",
  "tags": []
}
```

---

## Booking Endpoints

### GET /businesses/{businessId}/bookings

Get bookings with filtering and pagination.

**Query Parameters:**
- `page`, `pageSize`, `sortBy`, `sortDirection`
- `status` - Filter by status
- `staffId` - Filter by staff
- `customerId` - Filter by customer
- `startDate`, `endDate` - Date range filter

**Response (200):**
```json
{
  "isSuccess": true,
  "data": {
    "items": [
      {
        "id": "booking-guid",
        "businessId": "business-guid",
        "customerId": "customer-guid",
        "staffId": "staff-guid",
        "serviceId": "service-guid",
        "startTime": "2024-01-15T10:00:00Z",
        "endTime": "2024-01-15T10:30:00Z",
        "status": "confirmed",
        "notes": null,
        "price": 350,
        "currency": "SEK",
        "customer": { ... },
        "staff": { ... },
        "service": { ... }
      }
    ],
    "totalCount": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

**Booking Status (enum):**
- `pending`
- `confirmed`
- `cancelled`
- `completed`
- `no_show`

---

### POST /businesses/{businessId}/bookings

Create a new booking.

**Request (existing customer):**
```json
{
  "customerId": "customer-guid",
  "staffId": "staff-guid",
  "serviceId": "service-guid",
  "startTime": "2024-01-15T10:00:00Z",
  "notes": "First time client"
}
```

**Request (guest booking - new customer):**
```json
{
  "staffId": "staff-guid",
  "serviceId": "service-guid",
  "startTime": "2024-01-15T10:00:00Z",
  "customerEmail": "guest@example.com",
  "customerFirstName": "Guest",
  "customerLastName": "User",
  "customerPhoneNumber": "+1234567890"
}
```

---

### GET /businesses/{businessId}/availability

Get available time slots for booking.

**Query Parameters:**
- `staffId` (optional) - Specific staff member
- `serviceId` (required) - Service to book
- `date` (required) - Date in YYYY-MM-DD format

**Response (200):**
```json
{
  "isSuccess": true,
  "data": {
    "date": "2024-01-15",
    "slots": [
      {
        "startTime": "2024-01-15T09:00:00Z",
        "endTime": "2024-01-15T09:30:00Z",
        "isAvailable": true
      },
      {
        "startTime": "2024-01-15T09:30:00Z",
        "endTime": "2024-01-15T10:00:00Z",
        "isAvailable": false
      }
    ]
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

### POST /businesses/{businessId}/bookings/{bookingId}/cancel

Cancel a booking.

**Request:**
```json
{
  "reason": "Customer requested cancellation"
}
```

---

### PATCH /businesses/{businessId}/bookings/{bookingId}/confirm

Confirm a pending booking.

---

### PATCH /businesses/{businessId}/bookings/{bookingId}/complete

Mark booking as completed.

---

### PATCH /businesses/{businessId}/bookings/{bookingId}/no-show

Mark as no-show.

---

## Dashboard Endpoint

### GET /businesses/{businessId}/dashboard

Get dashboard statistics.

**Response (200):**
```json
{
  "isSuccess": true,
  "data": {
    "todayBookings": 5,
    "weekBookings": 25,
    "monthBookings": 100,
    "totalCustomers": 150,
    "totalRevenue": 75000,
    "averageBookingValue": 350,
    "popularServices": [
      {
        "serviceId": "service-guid",
        "serviceName": "Haircut",
        "bookingCount": 50,
        "revenue": 17500
      }
    ],
    "upcomingBookings": [
      {
        "id": "booking-guid",
        "startTime": "2024-01-15T10:00:00Z",
        "customer": { ... },
        "service": { ... },
        "staff": { ... }
      }
    ]
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

## Reference Data Endpoints

### GET /reference/countries

Get list of countries.

**Response (200):**
```json
{
  "isSuccess": true,
  "data": [
    { "code": "SE", "name": "Sweden" },
    { "code": "NO", "name": "Norway" },
    { "code": "US", "name": "United States" }
  ],
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

### GET /reference/timezones

Get list of timezones.

**Response (200):**
```json
{
  "isSuccess": true,
  "data": [
    "Europe/Stockholm",
    "Europe/Oslo",
    "America/New_York"
  ],
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

### GET /reference/business-types

Get available business types.

**Response (200):**
```json
{
  "isSuccess": true,
  "data": [
    { "value": "hair_salon", "label": "Hair Salon" },
    { "value": "barber_shop", "label": "Barber Shop" },
    { "value": "spa_wellness", "label": "Spa & Wellness" },
    { "value": "beauty_clinic", "label": "Beauty Clinic" },
    { "value": "personal_training", "label": "Personal Training" },
    { "value": "therapy_coaching", "label": "Therapy & Coaching" },
    { "value": "other", "label": "Other" }
  ],
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

---

## Error Codes Reference

Use these standard error codes in your responses:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNKNOWN_ERROR` | 500 | Unexpected error |
| `VALIDATION_FAILED` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `CONFLICT` | 409 | Resource conflict |
| `BAD_REQUEST` | 400 | Invalid request |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `EMAIL_NOT_VERIFIED` | 401 | Email not verified |
| `ACCOUNT_DISABLED` | 401 | Account is disabled |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `INVALID_TOKEN` | 401 | JWT token invalid |
| `EMAIL_ALREADY_EXISTS` | 409 | Email taken |
| `BUSINESS_NOT_FOUND` | 404 | Business doesn't exist |
| `SLOT_NOT_AVAILABLE` | 409 | Time slot already booked |
| `BOOKING_NOT_FOUND` | 404 | Booking doesn't exist |
| `CUSTOMER_NOT_FOUND` | 404 | Customer doesn't exist |

---

## Priority Implementation Order

Start with these endpoints to get a working integration:

1. **Phase 1 - Authentication:**
   - `POST /auth/login`
   - `POST /auth/register`
   - `POST /auth/me`
   - `POST /auth/logout`

2. **Phase 2 - Business Setup:**
   - `GET /businesses/my`
   - `POST /businesses`

3. **Phase 3 - Core Features:**
   - `GET /businesses/{id}/staff`
   - `GET /businesses/{id}/services`
   - `GET /businesses/{id}/customers`
   - `GET /businesses/{id}/bookings`
   - `GET /businesses/{id}/dashboard`

4. **Phase 4 - Booking Flow:**
   - `GET /businesses/{id}/availability`
   - `POST /businesses/{id}/bookings`
   - `POST /businesses/{id}/bookings/{id}/cancel`
