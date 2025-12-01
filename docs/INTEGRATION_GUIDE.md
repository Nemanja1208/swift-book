# Booklyfy Frontend + .NET Backend Integration Guide

This guide will help you connect the Booklyfy React frontend to your .NET Clean Architecture API backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Architecture Overview](#architecture-overview)
4. [Step-by-Step Integration](#step-by-step-integration)
5. [API Response Format](#api-response-format)
6. [Authentication Flow](#authentication-flow)
7. [Testing Your Integration](#testing-your-integration)

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or higher) installed
- **npm** or **yarn** package manager
- Your **.NET Clean Architecture API** running locally
- Basic understanding of React and .NET

---

## Quick Start

### 1. Clone and Install

```bash
# Navigate to the frontend directory
cd swift-book

# Install dependencies
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# Point to your .NET API
VITE_API_BASE_URL=http://localhost:5000/api

# IMPORTANT: Set to 'false' to use your real API
VITE_USE_MOCK_DATA=false
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will run at `http://localhost:8080`

---

## Architecture Overview

### Frontend Structure

```
src/
├── components/          # Reusable UI components
├── contexts/            # React Context (AuthContext)
├── hooks/               # Custom hooks (use-api, use-toast)
├── pages/               # Route page components
├── services/            # API service layer (THIS IS KEY!)
│   ├── api-client.ts    # HTTP client with token management
│   ├── auth.service.ts  # Authentication endpoints
│   ├── booking.service.ts
│   ├── business.service.ts
│   ├── customer.service.ts
│   ├── service.service.ts
│   ├── staff.service.ts
│   └── reference-data.service.ts
├── types/               # TypeScript interfaces
│   ├── index.ts         # Domain models
│   └── api.ts           # OperationResult wrapper
└── App.tsx              # Main app with routing
```

### How Frontend Talks to Backend

```
React Component
     │
     ▼
Service Layer (auth.service.ts, booking.service.ts, etc.)
     │
     ▼
API Client (api-client.ts) ──── Adds JWT token to headers
     │
     ▼
Your .NET API (/api/auth/login, /api/businesses, etc.)
     │
     ▼
OperationResult<T> response
```

---

## Step-by-Step Integration

### Step 1: Disable Mock Mode

The frontend has a built-in mock data system for development. **You must disable it** to connect to your real API.

In your `.env` file:

```env
VITE_USE_MOCK_DATA=false
```

### Step 2: Configure Your API Base URL

Set the URL where your .NET API is running:

```env
# If your API runs on port 5000
VITE_API_BASE_URL=http://localhost:5000/api

# If your API runs on port 7000
VITE_API_BASE_URL=http://localhost:7000/api

# If using HTTPS
VITE_API_BASE_URL=https://localhost:5001/api
```

### Step 3: Enable CORS in Your .NET API

Your .NET backend must allow requests from the frontend. Add this to your `Program.cs`:

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:8080") // Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ... later in the file
app.UseCors("AllowFrontend");
```

### Step 4: Implement the OperationResult Pattern

**This is critical!** The frontend expects ALL API responses to follow this format:

```csharp
// Application/Common/OperationResult.cs
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
}

public class ValidationError
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Code { get; set; }
}
```

Example success response:

```json
{
  "isSuccess": true,
  "data": {
    "id": "user-1",
    "email": "john@example.com",
    "firstName": "John"
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

Example error response:

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

### Step 5: Implement Required API Endpoints

At minimum, implement these endpoints to get started:

#### Authentication (Required First!)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/me` | Get current user |

#### Business (Required for Dashboard)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/businesses/my` | Get user's businesses |
| POST | `/api/businesses` | Create new business |

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for the complete endpoint list.

---

## API Response Format

### Success Response Structure

```typescript
interface OperationResult<T> {
  isSuccess: true;
  data: T;
  error: null;
  validationErrors: [];
  statusCode: 200 | 201;
}
```

### Error Response Structure

```typescript
interface OperationResult<T> {
  isSuccess: false;
  data: null;
  error: {
    code: string;    // e.g., "INVALID_CREDENTIALS"
    message: string; // Human-readable message
    details?: string;
  };
  validationErrors: [];
  statusCode: 400 | 401 | 403 | 404 | 500;
}
```

### Validation Error Structure

```typescript
interface OperationResult<T> {
  isSuccess: false;
  data: null;
  error: {
    code: "VALIDATION_FAILED";
    message: "One or more validation errors occurred.";
  };
  validationErrors: [
    { field: "email", message: "Email is required" },
    { field: "password", message: "Password must be at least 8 characters" }
  ];
  statusCode: 400;
}
```

---

## Authentication Flow

### How JWT Authentication Works

1. **User logs in** → Frontend sends credentials to `/api/auth/login`
2. **Backend validates** → Returns `accessToken` and `refreshToken`
3. **Frontend stores tokens** → In localStorage
4. **Subsequent requests** → Include `Authorization: Bearer {accessToken}` header
5. **Token expires** → Frontend calls `/api/auth/refresh` with refreshToken

### Login Request/Response

**Request:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "isSuccess": true,
  "data": {
    "user": {
      "id": "guid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true,
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
    "expiresAt": "2024-01-01T12:00:00Z"
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

### Implementing JWT in .NET

```csharp
// Add to Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });
```

---

## Testing Your Integration

### Test 1: Check API Connection

1. Start your .NET API
2. Start the frontend with `npm run dev`
3. Open browser DevTools (F12) → Network tab
4. Try to login
5. Check if requests go to your API URL (not mock)

### Test 2: Verify Response Format

Your API responses should match exactly:

```javascript
// In browser console, after a failed login:
{
  isSuccess: false,
  data: null,
  error: { code: "INVALID_CREDENTIALS", message: "..." },
  validationErrors: [],
  statusCode: 401
}
```

### Test 3: Check CORS

If you see CORS errors in the console:

```
Access to fetch at 'http://localhost:5000/api/auth/login' from origin
'http://localhost:8080' has been blocked by CORS policy
```

→ Double-check your CORS configuration in .NET

### Test 4: Verify Token Handling

After successful login:
1. Check localStorage for `accessToken` and `refreshToken`
2. Make another request and verify the `Authorization` header is present

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still using mock data | Check `VITE_USE_MOCK_DATA=false` in `.env` |
| CORS errors | Add CORS policy to .NET Program.cs |
| 404 on API calls | Verify `VITE_API_BASE_URL` matches your API |
| Login succeeds but dashboard fails | Implement `/api/businesses/my` endpoint |
| Token not being sent | Check if login response includes tokens |

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more solutions.

---

## Next Steps

1. Read [API_ENDPOINTS.md](./API_ENDPOINTS.md) for all endpoint specifications
2. Read [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed authentication setup
3. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if you encounter issues

---

## Need Help?

- Check the existing `API_MODELS.md` file for complete domain model specifications
- Look at `src/services/*.ts` files to see exactly what the frontend expects
- Check `src/types/index.ts` for all TypeScript interfaces
