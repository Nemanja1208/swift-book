# Troubleshooting Guide

Common issues and solutions when integrating the Booklyfy frontend with your .NET backend.

---

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [CORS Errors](#cors-errors)
3. [Authentication Issues](#authentication-issues)
4. [Response Format Issues](#response-format-issues)
5. [Mock Data Still Active](#mock-data-still-active)
6. [Dashboard/Business Issues](#dashboardbusiness-issues)
7. [Debugging Tips](#debugging-tips)

---

## Connection Issues

### Problem: "Network error occurred"

**Symptoms:**
- Console shows "API GET Error" or "API POST Error"
- Toast message says "Network error occurred"

**Causes & Solutions:**

1. **API not running**
   ```bash
   # Make sure your .NET API is running
   dotnet run
   ```

2. **Wrong port in .env**
   ```env
   # Check your .NET API port and update .env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. **HTTPS mismatch**
   ```env
   # If your API uses HTTPS
   VITE_API_BASE_URL=https://localhost:5001/api
   ```

---

### Problem: 404 Not Found on API calls

**Symptoms:**
- Network tab shows 404 status
- API requests going to wrong URL

**Solutions:**

1. **Check your routes match**
   - Frontend expects: `/api/auth/login`
   - Your controller should be: `[Route("api/auth")]`

2. **Check trailing slashes**
   ```env
   # Correct - no trailing slash
   VITE_API_BASE_URL=http://localhost:5000/api

   # Wrong - has trailing slash
   VITE_API_BASE_URL=http://localhost:5000/api/
   ```

3. **Verify endpoint exists**
   ```bash
   # Test directly with curl
   curl http://localhost:5000/api/auth/login
   ```

---

## CORS Errors

### Problem: "Access blocked by CORS policy"

**Symptoms:**
```
Access to fetch at 'http://localhost:5000/api/auth/login' from origin
'http://localhost:8080' has been blocked by CORS policy
```

**Solution - Add CORS to Program.cs:**

```csharp
// Program.cs

var builder = WebApplication.CreateBuilder(args);

// Add CORS
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

// IMPORTANT: UseCors BEFORE UseAuthentication
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
```

**Common CORS Mistakes:**

1. **Wrong origin URL**
   ```csharp
   // Wrong - different port
   .WithOrigins("http://localhost:3000")

   // Correct - frontend runs on 8080
   .WithOrigins("http://localhost:8080")
   ```

2. **CORS after Auth**
   ```csharp
   // Wrong order
   app.UseAuthentication();
   app.UseCors("AllowFrontend");  // Too late!

   // Correct order
   app.UseCors("AllowFrontend");  // Before Auth
   app.UseAuthentication();
   ```

3. **Missing AllowCredentials**
   ```csharp
   // If using cookies or credentials
   .AllowCredentials()
   ```

---

## Authentication Issues

### Problem: Login returns success but user not authenticated

**Symptoms:**
- Login API returns 200
- Redirects to dashboard
- Dashboard shows error or redirects back to login

**Causes:**

1. **Response format wrong** - tokens not being stored

   Your login response MUST have this structure:
   ```json
   {
     "isSuccess": true,
     "data": {
       "user": { ... },
       "accessToken": "eyJ...",     // Must be present
       "refreshToken": "abc...",    // Must be present
       "expiresAt": "2024-..."
     }
   }
   ```

2. **Property names wrong** - must be camelCase
   ```json
   // Wrong (PascalCase)
   { "AccessToken": "..." }

   // Correct (camelCase)
   { "accessToken": "..." }
   ```

**Debug:**
```javascript
// In browser console after login
localStorage.getItem('accessToken')  // Should show token
localStorage.getItem('refreshToken') // Should show token
```

---

### Problem: 401 Unauthorized on /auth/me

**Symptoms:**
- Login works
- `/auth/me` returns 401
- User gets logged out

**Causes:**

1. **Token not being sent**

   Check Network tab - Request Headers should show:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

2. **Token validation failing**

   Check your JWT configuration:
   ```csharp
   // Make sure these match between token generation and validation
   ValidIssuer = "BooklyfyAPI"     // Must match
   ValidAudience = "BooklyfyFrontend"  // Must match
   ```

3. **Token expired**

   Increase token lifetime for testing:
   ```json
   {
     "Jwt": {
       "AccessTokenExpirationMinutes": 1440  // 24 hours
     }
   }
   ```

---

### Problem: "Invalid token" error

**Solutions:**

1. **Check JWT key is long enough** (at least 32 characters)
   ```json
   {
     "Jwt": {
       "Key": "ThisKeyMustBeAtLeastThirtyTwoCharactersLong!"
     }
   }
   ```

2. **Check clock synchronization**
   ```csharp
   // Add some tolerance for clock skew
   ClockSkew = TimeSpan.FromMinutes(5)
   ```

---

## Response Format Issues

### Problem: Frontend doesn't show data/errors properly

**The frontend expects EXACTLY this format:**

```json
{
  "isSuccess": boolean,
  "data": T | null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  } | null,
  "validationErrors": [],
  "statusCode": number
}
```

**Common mistakes:**

1. **Using .NET default error format**
   ```json
   // Wrong - ASP.NET default
   { "title": "Not Found", "status": 404 }

   // Correct - OperationResult format
   {
     "isSuccess": false,
     "data": null,
     "error": { "code": "NOT_FOUND", "message": "..." },
     "validationErrors": [],
     "statusCode": 404
   }
   ```

2. **PascalCase instead of camelCase**

   Add to Program.cs:
   ```csharp
   builder.Services.AddControllers()
       .AddJsonOptions(options =>
       {
           options.JsonSerializerOptions.PropertyNamingPolicy =
               JsonNamingPolicy.CamelCase;
       });
   ```

3. **Missing validationErrors array**
   ```json
   // Wrong - missing validationErrors
   { "isSuccess": false, "data": null, "error": {...} }

   // Correct - include empty array
   { "isSuccess": false, "data": null, "error": {...}, "validationErrors": [] }
   ```

---

## Mock Data Still Active

### Problem: Changes to real API not reflected

**Symptoms:**
- API is running and working (tested with curl)
- Frontend still shows test/mock data
- "John Owner" appears instead of your real user

**Solution:**

1. **Check .env file exists** (not just .env.example)
   ```bash
   # Create .env from example
   cp .env.example .env
   ```

2. **Set mock mode to false**
   ```env
   VITE_USE_MOCK_DATA=false
   ```

3. **Restart frontend after changing .env**
   ```bash
   # Stop the dev server (Ctrl+C)
   # Start again
   npm run dev
   ```

4. **Clear localStorage**
   ```javascript
   // In browser console
   localStorage.clear()
   ```

5. **Hard refresh browser**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

**Verify mock is disabled:**
```javascript
// In browser console
// If this shows 'false', mock is disabled
import.meta.env.VITE_USE_MOCK_DATA
```

---

## Dashboard/Business Issues

### Problem: Dashboard shows "No businesses found"

**Symptoms:**
- Login works
- Dashboard loads but shows empty state
- No business data displayed

**Causes:**

1. **`/api/businesses/my` not implemented**

   This endpoint must return user's businesses:
   ```json
   {
     "isSuccess": true,
     "data": [
       {
         "id": "guid",
         "name": "My Business",
         "type": "hair_salon",
         ...
       }
     ]
   }
   ```

2. **No business created for user**

   After registration, user needs to create a business. Check if `/api/businesses` POST is working.

3. **Wrong user ID in query**

   Make sure you're filtering businesses by the authenticated user's ID from the JWT token.

---

### Problem: Business creation fails

**Check these endpoints are implemented:**
- `POST /api/businesses` - Create business
- Response must include the created business with `id`

**Request format:**
```json
{
  "name": "My Salon",
  "type": "hair_salon",
  "country": "SE",
  "timezone": "Europe/Stockholm"
}
```

---

## Debugging Tips

### 1. Check Network Tab

Open DevTools (F12) → Network tab:
- Look at request URL
- Check request headers (Authorization)
- Check response body
- Check status code

### 2. Check Console

Open DevTools → Console tab:
- Look for red error messages
- API errors are logged with `console.error`

### 3. Test API Directly

```bash
# Test without frontend
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### 4. Check localStorage

```javascript
// In browser console
localStorage.getItem('accessToken')   // Check token stored
localStorage.getItem('refreshToken')  // Check refresh token
```

### 5. Clear Everything

```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### 6. Check API is Listening

```bash
# Windows
netstat -an | findstr "5000"

# Mac/Linux
lsof -i :5000
```

---

## Quick Checklist

When things don't work, check these in order:

- [ ] `.env` file exists (not just `.env.example`)
- [ ] `VITE_USE_MOCK_DATA=false` is set
- [ ] `VITE_API_BASE_URL` matches your API URL
- [ ] Frontend was restarted after `.env` changes
- [ ] .NET API is running
- [ ] CORS is configured for `http://localhost:8080`
- [ ] CORS middleware is BEFORE Auth middleware
- [ ] All responses use OperationResult format
- [ ] JSON uses camelCase property names
- [ ] Login returns `accessToken` and `refreshToken`
- [ ] Protected endpoints have `[Authorize]` attribute
- [ ] JWT Issuer/Audience match in config and token validation

---

## Still Having Issues?

1. **Check the source code** - Look at `src/services/*.ts` to see exactly what the frontend expects
2. **Compare with mock data** - Check `src/services/mock-data.ts` for example data structures
3. **Read the API contract** - Check `API_MODELS.md` for complete specifications
4. **Use Postman/Insomnia** - Test your API independently before frontend integration
