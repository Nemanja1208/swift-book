# Authentication Setup Guide

Complete guide for implementing JWT authentication in your .NET Clean Architecture backend to work with the Booklyfy frontend.

---

## Table of Contents

1. [Overview](#overview)
2. [Required NuGet Packages](#required-nuget-packages)
3. [Configuration](#configuration)
4. [Token Service Implementation](#token-service-implementation)
5. [Auth Controller Implementation](#auth-controller-implementation)
6. [OperationResult Wrapper](#operationresult-wrapper)
7. [How the Frontend Handles Auth](#how-the-frontend-handles-auth)
8. [Testing Authentication](#testing-authentication)

---

## Overview

The frontend uses JWT (JSON Web Token) authentication:

1. User submits email/password
2. Backend validates credentials and returns tokens
3. Frontend stores tokens in localStorage
4. All subsequent API calls include `Authorization: Bearer {token}`
5. Backend validates token on protected endpoints

---

## Required NuGet Packages

Add these packages to your API/Presentation project:

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
```

---

## Configuration

### appsettings.json

```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "BooklyfyAPI",
    "Audience": "BooklyfyFrontend",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

**Important:** In production, store the key in environment variables or Azure Key Vault!

### Program.cs

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
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
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        ClockSkew = TimeSpan.Zero // Remove default 5 min tolerance
    };
});

// Add CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ... other services

var app = builder.Build();

// Use CORS before Auth
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

---

## Token Service Implementation

### Interface (Application Layer)

```csharp
// Application/Interfaces/ITokenService.cs
namespace Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
}
```

### Implementation (Infrastructure Layer)

```csharp
// Infrastructure/Services/TokenService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.GivenName, user.FirstName),
            new Claim(ClaimTypes.Surname, user.LastName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var expirationMinutes = int.Parse(
            _config["Jwt:AccessTokenExpirationMinutes"] ?? "60");

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);

        try
        {
            var principal = tokenHandler.ValidateToken(token,
                new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _config["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _config["Jwt:Audience"],
                    ValidateLifetime = false // Don't validate for refresh
                }, out _);

            return principal;
        }
        catch
        {
            return null;
        }
    }
}
```

---

## Auth Controller Implementation

```csharp
// Presentation/Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthController(
        IUserRepository userRepository,
        ITokenService tokenService,
        IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("login")]
    public async Task<ActionResult<OperationResult<LoginResponse>>> Login(
        [FromBody] LoginRequest request)
    {
        // Find user by email
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            return Unauthorized(OperationResult<LoginResponse>.Failure(
                "INVALID_CREDENTIALS",
                "Invalid email or password",
                401
            ));
        }

        // Verify password
        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(OperationResult<LoginResponse>.Failure(
                "INVALID_CREDENTIALS",
                "Invalid email or password",
                401
            ));
        }

        // Check if account is active
        if (!user.IsActive)
        {
            return Unauthorized(OperationResult<LoginResponse>.Failure(
                "ACCOUNT_DISABLED",
                "Your account has been disabled",
                401
            ));
        }

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Store refresh token (in database)
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        var response = new LoginResponse
        {
            User = MapToUserDto(user),
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60)
        };

        return Ok(OperationResult<LoginResponse>.Success(response));
    }

    [HttpPost("register")]
    public async Task<ActionResult<OperationResult<UserDto>>> Register(
        [FromBody] RegisterRequest request)
    {
        // Check if email exists
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);

        if (existingUser != null)
        {
            return Conflict(OperationResult<UserDto>.Failure(
                "EMAIL_ALREADY_EXISTS",
                "A user with this email already exists",
                409
            ));
        }

        // Create user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PasswordHash = _passwordHasher.Hash(request.Password),
            IsEmailVerified = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        return Created("", OperationResult<UserDto>.Success(
            MapToUserDto(user), 201));
    }

    [HttpPost("me")]
    [Authorize]
    public async Task<ActionResult<OperationResult<UserDto>>> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(OperationResult<UserDto>.Failure(
                "UNAUTHORIZED",
                "Not authenticated",
                401
            ));
        }

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));

        if (user == null)
        {
            return NotFound(OperationResult<UserDto>.Failure(
                "USER_NOT_FOUND",
                "User not found",
                404
            ));
        }

        return Ok(OperationResult<UserDto>.Success(MapToUserDto(user)));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<OperationResult<object>>> Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));
            if (user != null)
            {
                // Clear refresh token
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _userRepository.UpdateAsync(user);
            }
        }

        return Ok(OperationResult<object>.Success(null));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<OperationResult<LoginResponse>>> RefreshToken(
        [FromBody] RefreshTokenRequest request)
    {
        // Find user with this refresh token
        var user = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken);

        if (user == null ||
            user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return Unauthorized(OperationResult<LoginResponse>.Failure(
                "INVALID_TOKEN",
                "Invalid or expired refresh token",
                401
            ));
        }

        // Generate new tokens
        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        // Update refresh token
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userRepository.UpdateAsync(user);

        var response = new LoginResponse
        {
            User = MapToUserDto(user),
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60)
        };

        return Ok(OperationResult<LoginResponse>.Success(response));
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id.ToString(),
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            ProfileImageUrl = user.ProfileImageUrl,
            IsEmailVerified = user.IsEmailVerified,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
```

---

## OperationResult Wrapper

### Implementation

```csharp
// Application/Common/OperationResult.cs
namespace Application.Common;

public class OperationResult<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public ApiError? Error { get; set; }
    public List<ValidationError> ValidationErrors { get; set; } = new();
    public int StatusCode { get; set; }

    // Factory methods
    public static OperationResult<T> Success(T data, int statusCode = 200)
    {
        return new OperationResult<T>
        {
            IsSuccess = true,
            Data = data,
            Error = null,
            StatusCode = statusCode
        };
    }

    public static OperationResult<T> Failure(
        string code,
        string message,
        int statusCode = 400,
        string? details = null)
    {
        return new OperationResult<T>
        {
            IsSuccess = false,
            Data = default,
            Error = new ApiError
            {
                Code = code,
                Message = message,
                Details = details
            },
            StatusCode = statusCode
        };
    }

    public static OperationResult<T> ValidationFailure(
        List<ValidationError> errors)
    {
        return new OperationResult<T>
        {
            IsSuccess = false,
            Data = default,
            Error = new ApiError
            {
                Code = "VALIDATION_FAILED",
                Message = "One or more validation errors occurred."
            },
            ValidationErrors = errors,
            StatusCode = 400
        };
    }
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

---

## DTOs

```csharp
// Application/DTOs/Auth/LoginRequest.cs
public record LoginRequest(string Email, string Password);

// Application/DTOs/Auth/LoginResponse.cs
public class LoginResponse
{
    public UserDto User { get; set; } = null!;
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

// Application/DTOs/Auth/RegisterRequest.cs
public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName
);

// Application/DTOs/Auth/RefreshTokenRequest.cs
public record RefreshTokenRequest(string RefreshToken);

// Application/DTOs/User/UserDto.cs
public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public bool IsEmailVerified { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

---

## How the Frontend Handles Auth

Understanding how the frontend works helps you implement the backend correctly:

### Token Storage (api-client.ts)

```typescript
// Frontend stores tokens in localStorage
export function setTokens(access: string, refresh: string): void {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

// Retrieves token for API calls
export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

// Adds token to all requests
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
```

### Auth Context (AuthContext.tsx)

```typescript
// On app load, checks if user is logged in
useEffect(() => {
  const checkAuth = async () => {
    const token = getAccessToken();
    if (token) {
      const result = await getCurrentUser();
      if (result.isSuccess && result.data) {
        setUser(result.data);
      } else {
        clearTokens();
      }
    }
    setLoading(false);
  };
  checkAuth();
}, []);

// Login function
const loginHandler = async (email: string, password: string) => {
  const result = await login({ email, password });
  if (result.isSuccess && result.data) {
    setUser(result.data.user);
    navigate('/dashboard');
    return { success: true };
  }
  return { success: false, error: result.error?.message };
};
```

---

## Testing Authentication

### Test 1: Login Flow

```bash
# POST to login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

Expected response:
```json
{
  "isSuccess": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "abc123...",
    "expiresAt": "2024-01-01T12:00:00Z"
  },
  "error": null,
  "validationErrors": [],
  "statusCode": 200
}
```

### Test 2: Protected Endpoint

```bash
# Use the accessToken from login
curl -X POST http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Test 3: Invalid Credentials

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "wrong@example.com", "password": "wrong"}'
```

Expected error response:
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

## Checklist

Before testing with the frontend:

- [ ] JWT authentication is configured in Program.cs
- [ ] CORS is enabled for `http://localhost:8080`
- [ ] `/api/auth/login` returns `OperationResult<LoginResponse>`
- [ ] `/api/auth/register` returns `OperationResult<UserDto>`
- [ ] `/api/auth/me` returns `OperationResult<UserDto>` (requires auth)
- [ ] `/api/auth/logout` clears refresh token (requires auth)
- [ ] All responses follow the exact JSON structure
- [ ] Error codes match the expected codes (INVALID_CREDENTIALS, etc.)
- [ ] `expiresAt` is an ISO 8601 date string

---

## Common Mistakes

1. **Wrong JSON property names** - Use camelCase (JavaScript style), not PascalCase
   - Wrong: `{ "IsSuccess": true }`
   - Right: `{ "isSuccess": true }`

2. **Missing CORS** - Frontend can't connect without CORS configuration

3. **Token not in response** - Login must return both `accessToken` and `refreshToken`

4. **Wrong status codes** - 401 for auth errors, 409 for conflicts, 400 for validation

5. **Wrong Content-Type** - Always return `application/json`

---

## Next Steps

After authentication works:
1. Implement `/api/businesses/my` endpoint
2. Implement `/api/businesses` POST endpoint
3. Test the full registration → login → dashboard flow
