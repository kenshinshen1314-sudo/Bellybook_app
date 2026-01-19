# Bellybook Authentication System - Complete Implementation

## 🎯 Overview

This document describes the complete authentication system integration between the Bellybook frontend application and backend API. The system provides secure JWT-based authentication with automatic token refresh, comprehensive error handling, and a seamless user experience.

---

## 📁 Project Structure

### Backend (`/Users/kenshin/projects/Bellybook_backend`)

```
src/modules/auth/
├── auth.controller.ts          # Auth endpoints (register, login, logout, refresh, me)
├── auth.service.ts              # Auth business logic
├── auth.module.ts               # Auth module configuration
└── dto/
    ├── register.dto.ts          # Registration validation
    ├── login.dto.ts             # Login validation
    ├── refresh-token.dto.ts     # Refresh token validation
    └── auth-response.dto.ts     # Response types
```

### Frontend (`/Users/kenshin/projects/Bellybook_app`)

```
src/
├── api/
│   ├── auth.ts                  # Backend API client for auth
│   ├── errors.ts                # Auth error types and parsing
│   ├── client.ts                # HTTP client with token management
│   └── index.ts                 # API exports
├── services/
│   └── authService.ts           # Auth service layer (uses backend API)
├── contexts/
│   └── AuthContext.tsx          # React auth context
├── hooks/
│   └── useAuthError.ts          # Auth error handling hook
├── views/
│   └── AuthViews.tsx            # Login/Register UI components
└── utils/
    └── authTest.ts              # Test utilities
```

---

## 🔐 API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser123",
  "password": "password123",
  "displayName": "Test User",
  "email": "optional@example.com"
}
```

**Response:**
```json
{
  "user": {
    "id": "cm...",
    "username": "testuser123",
    "displayName": "Test User",
    "email": "optional@example.com",
    "subscriptionTier": "FREE",
    "createdAt": "2024-01-18T..."
  },
  "accessToken": "eyJ...",
  "refreshToken": "...",
  "expiresIn": 900
}
```

#### 2. Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "testuser123",
  "password": "password123"
}
```

**Response:** Same as register

#### 3. Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**Response:** New tokens

### Protected Endpoints (Authentication Required)

#### 4. Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <access-token>
```

#### 5. Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
```

---

## 🔄 Authentication Flow

### Registration Flow Diagram
```
┌─────────────┐
│ User fills  │
│  register   │
│   form      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Client-side Validation                  │
│  - Username: min 3 chars                │
│  - Password: min 8 chars                │
│  - Passwords match                      │
└──────┬──────────────────────────────────┘
       │ Valid
       ▼
┌─────────────────────────────────────────┐
│  authService.register()                 │
│  └─► authApi.register()                │
│      └─► POST /auth/register            │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend                                │
│  - Validate username unique             │
│  - Hash password (bcrypt)               │
│  - Create user in DB                    │
│  - Generate JWT tokens                  │
│  - Store refresh token                  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend                               │
│  - Store tokens in localStorage         │
│  - Create user session                  │
│  - Create IndexedDB profile             │
│  - Migrate offline data                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────┐
│  Redirect   │
│  to app     │
└─────────────┘
```

### Token Refresh Flow (Automatic)
```
┌─────────────────────────────────────────┐
│  API Call with Access Token             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend returns 401 Unauthorized       │
│  (Token expired)                        │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  apiClient detects 401                  │
│  - Check if refresh token exists        │
│  - Skip refresh if already attempted    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  refreshAccessToken()                   │
│  └─► POST /auth/refresh                │
│      └─► { refreshToken }               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend                                │
│  - Validate refresh token               │
│  - Check not revoked/expired            │
│  - Revoke old refresh token             │
│  - Generate new tokens                  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend                               │
│  - Store new tokens                     │
│  - Retry original request               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  User continues seamlessly              │
└─────────────────────────────────────────┘
```

---

## 🛠️ Usage Examples

### Basic Authentication

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { login, register, logout, user, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      const session = await login({
        username: 'testuser',
        password: 'password123',
      });
      console.log('Logged in:', session.username);
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  const handleRegister = async () => {
    try {
      const session = await register({
        username: 'newuser',
        password: 'password123',
        displayName: 'New User',
      });
      console.log('Registered:', session.username);
    } catch (error) {
      console.error('Registration failed:', error.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    console.log('Logged out');
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.displayName}!</p>
      ) : (
        <p>Please log in</p>
      )}
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### Error Handling

```typescript
import {
  AuthError,
  ValidationError,
  InvalidCredentialsError,
  UserExistsError,
  NetworkError,
  getErrorMessage,
} from '@/api/errors';
import { useAuthError } from '@/hooks/useAuthError';

function MyForm() {
  const { error, setError, clearError } = useAuthError();

  const handleSubmit = async () => {
    try {
      await login({ username, password });
      clearError();
    } catch (err) {
      setError(err);

      // Handle specific error types
      if (err instanceof InvalidCredentialsError) {
        // Show specific message for wrong credentials
      } else if (err instanceof NetworkError) {
        // Show network error message
      }
    }
  };

  return (
    <form>
      {error && <div className="error">{error}</div>}
      {/* ... */}
    </form>
  );
}
```

### Making Authenticated API Calls

```typescript
import { apiClient } from '@/api';

// Automatically includes auth token
const meals = await apiClient.get('/meals', {});

// With parameters
const meals = await apiClient.get('/meals', {
  params: { page: 1, limit: 10 },
});
```

---

## 🧪 Testing

### Manual Testing

1. **Start Backend:**
   ```bash
   cd /Users/kenshin/projects/Bellybook_backend
   npm run start:dev
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Open Browser Console:**
   ```javascript
   // Run all auth tests
   authTest.runAllTests()

   // Test registration
   authTest.testRegister()

   // Test login
   authTest.testLogin('username', 'password')

   // Test error scenarios
   authTest.testErrorScenarios()
   ```

### Testing with Curl

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test123","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test123","password":"password123"}'

# Get current user
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Logout
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with salt
2. **JWT Tokens**: Signed with secret key
3. **Token Expiration**:
   - Access Token: 15 minutes
   - Refresh Token: 7 days
4. **Refresh Token Rotation**: New tokens on each refresh
5. **Token Revocation**: Tokens revoked on logout
6. **Input Validation**: class-validator on all inputs
7. **CORS Protection**: Configurable allowed origins

---

## 📊 Error Types

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| `NetworkError` | - | Connection issues |
| `ValidationError` | 400 | Invalid input |
| `InvalidCredentialsError` | 401 | Wrong username/password |
| `UnauthorizedError` | 401 | Not authenticated |
| `TokenExpiredError` | 401 | Session expired |
| `UserExistsError` | 409 | Username/email taken |

---

## ⚙️ Configuration

### Backend `.env`
```bash
# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Database (PostgreSQL)
DATABASE_URL=postgresql://...
```

### Frontend `.env`
```bash
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1

# Gemini API (for meal analysis)
VITE_GEMINI_API_KEY=your-key
VITE_DISHES_ANALYSIS_NUM=10
```

---

## 🚀 Deployment

### Backend Deployment
1. Set secure `JWT_SECRET` (use environment variable)
2. Configure production database
3. Set `CORS_ORIGIN` to production domain
4. Enable HTTPS
5. Review token expiration times

### Frontend Deployment
1. Update `VITE_API_URL` to production backend
2. Ensure HTTPS for all requests
3. Test token refresh in production
4. Monitor error rates

---

## 📝 Validation Rules

### Registration
- **Username**: 3-20 characters, alphanumeric + underscore only
- **Password**: 8-50 characters
- **Email**: Optional, must be valid email format
- **DisplayName**: Optional, 1-50 characters

### Login
- **Username**: Required, min 1 character
- **Password**: Required, min 1 character

---

## 🐛 Troubleshooting

### "Network error"
**Cause**: Backend not running or wrong URL
**Solution**:
- Check backend is running
- Verify `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### "Invalid credentials"
**Cause**: Wrong username or password
**Solution**: Verify credentials, check for typos

### "Username already exists"
**Cause**: User already registered
**Solution**: Use different username or login

### "Token expired"
**Cause**: Session expired
**Solution**: Logout and login again (auto-refresh should handle this)

### CORS errors
**Cause**: Frontend origin not allowed
**Solution**:
- Add origin to backend `CORS_ORIGIN`
- Ensure backend is configured for CORS

---

## 📚 Additional Resources

- **Complete Guide**: `COMPLETE_AUTH_GUIDE.md`
- **Test Utilities**: `src/utils/authTest.ts`
- **Error Types**: `src/api/errors.ts`
- **Auth Views**: `src/views/AuthViews.tsx`

---

## ✅ Implementation Checklist

- [x] Backend auth endpoints implemented
- [x] JWT token generation and validation
- [x] Refresh token mechanism
- [x] Frontend API client
- [x] Error types and handling
- [x] Token storage and management
- [x] Automatic token refresh
- [x] Login/Register UI
- [x] Loading states
- [x] Error display
- [x] Data migration from offline
- [x] Test utilities
- [x] Documentation

---

## 🎉 Summary

The Bellybook authentication system is now fully integrated with the backend API, providing:

- ✅ Secure JWT-based authentication
- ✅ Automatic token refresh
- ✅ Comprehensive error handling
- ✅ Type-safe error classes
- ✅ Offline data migration
- ✅ User profile management
- ✅ Production-ready code

**Status**: Ready for testing and deployment! 🚀
