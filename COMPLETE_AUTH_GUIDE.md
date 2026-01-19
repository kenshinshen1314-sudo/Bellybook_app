# Complete Authentication Integration Guide

## Overview
This guide covers the complete authentication integration between the Bellybook frontend app and backend API.

## Architecture

### Backend (`/Users/kenshin/projects/Bellybook_backend`)

#### Endpoints:
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout (requires auth)
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user (requires auth)
- `PATCH /api/v1/auth/profile` - Update user profile (requires auth)

#### Files:
- `src/modules/auth/auth.controller.ts` - Auth endpoints
- `src/modules/auth/auth.service.ts` - Auth business logic
- `src/modules/auth/dto/register.dto.ts` - Register validation
- `src/modules/auth/dto/login.dto.ts` - Login validation
- `src/modules/auth/dto/refresh-token.dto.ts` - Refresh token validation
- `src/modules/auth/dto/auth-response.dto.ts` - Response types

### Frontend (`/Users/kenshin/projects/Bellybook_app`)

#### Files:
- `src/api/auth.ts` - Backend API client for auth
- `src/api/errors.ts` - Custom error types and parsing
- `src/api/client.ts` - HTTP client with token management
- `src/services/authService.ts` - Auth service layer
- `src/contexts/AuthContext.tsx` - React auth context

## Authentication Flow

### Registration Flow
```
User fills registration form
  ↓
authService.register(data)
  ↓
authApi.register(data) → POST /auth/register
  ↓
Backend validates and creates user
  ↓
Returns JWT tokens (access + refresh)
  ↓
Tokens stored in localStorage by tokenManager
  ↓
User session created
  ↓
IndexedDB profile created
  ↓
Offline data migrated to new user
```

### Login Flow
```
User fills login form
  ↓
authService.login(data)
  ↓
authApi.login(data) → POST /auth/login
  ↓
Backend validates credentials
  ↓
Returns JWT tokens (access + refresh)
  ↓
Tokens stored in localStorage by tokenManager
  ↓
User session created
  ↓
IndexedDB profile ensured exists
  ↓
Offline data migrated to logged-in user
```

### Token Refresh Flow (Automatic)
```
API call made with expired access token
  ↓
Backend returns 401 Unauthorized
  ↓
apiClient detects 401
  ↓
Calls refreshAccessToken() → POST /auth/refresh
  ↓
Backend validates refresh token
  ↓
Returns new JWT tokens
  ↓
Old tokens revoked, new tokens stored
  ↓
Original API call retried with new token
  ↓
User continues seamlessly
```

### Logout Flow
```
User clicks logout
  ↓
authService.logout()
  ↓
authApi.logout() → POST /auth/logout
  ↓
Backend revokes refresh tokens
  ↓
tokenManager clears all tokens from localStorage
  ↓
User session cleared from state
  ↓
User redirected to login
```

## Error Handling

### Error Types:
- `NetworkError` - Connection issues
- `ValidationError` - Invalid input (400)
- `InvalidCredentialsError` - Wrong username/password (401)
- `UserExistsError` - Username/email already taken (409)
- `TokenExpiredError` - Session expired (401)
- `UnauthorizedError` - Not authenticated (401)
- `AuthError` - Base auth error

### Error Messages:
All errors are user-friendly and localized where applicable.

## Testing

### 1. Start Backend Server
```bash
cd /Users/kenshin/projects/Bellybook_backend
npm run start:dev
```
Expected output:
```
🚀 Application is running on: http://localhost:3000/api/v1
```

### 2. Start Frontend Dev Server
```bash
cd /Users/kenshin/projects/Bellybook_app
npm run dev
```

### 3. Test Registration

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "password123",
    "displayName": "Test User"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "cm...",
    "username": "testuser123",
    "displayName": "Test User",
    "subscriptionTier": "FREE",
    "createdAt": "2024-01-18T..."
  },
  "accessToken": "eyJ...",
  "refreshToken": "...",
  "expiresIn": 900
}
```

### 4. Test Login

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "password": "password123"
  }'
```

**Expected Response:** Same as registration

### 5. Test Refresh Token

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<your-refresh-token>"
  }'
```

**Expected Response:** New tokens

### 6. Test Get Current User

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <your-access-token>"
```

**Expected Response:** User profile

### 7. Test Logout

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer <your-access-token>"
```

**Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Validation Rules

### Registration:
- **Username**: 3-20 chars, alphanumeric + underscore only
- **Password**: 8-50 chars
- **Email**: Optional, must be valid email format
- **DisplayName**: Optional, 1-50 chars

### Login:
- **Username**: Required, min 1 char
- **Password**: Required, min 1 char

## Token Management

### Access Token:
- **Lifetime**: 15 minutes (configurable via `JWT_EXPIRES_IN`)
- **Usage**: All authenticated API requests
- **Format**: JWT

### Refresh Token:
- **Lifetime**: 7 days (configurable via `REFRESH_TOKEN_EXPIRES_IN`)
- **Usage**: Get new access token when expired
- **Format**: Random token stored in database
- **Revocation**: Token is revoked on logout or refresh

### Storage:
Tokens are stored in localStorage:
- `bb_access_token` - Current access token
- `bb_refresh_token` - Current refresh token
- `bb_token_expires_at` - Access token expiration timestamp

## Security Features

1. **Password Hashing**: bcrypt with salt
2. **JWT Tokens**: Signed with secret key
3. **Refresh Token Rotation**: New tokens on each refresh
4. **Token Revocation**: Tokens revoked on logout
5. **Token Expiration**: Both tokens have expiration
6. **CORS Enabled**: Configurable origins
7. **Input Validation**: class-validator on all inputs

## Configuration

### Backend (`.env`):
```bash
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### Frontend (`.env`):
```bash
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1

# Gemini API (for meal analysis)
VITE_GEMINI_API_KEY=your-key
VITE_DISHES_ANALYSIS_NUM=10
```

## Troubleshooting

### Issue: "Network error"
- **Cause**: Backend not running or wrong URL
- **Fix**: Check backend is running, verify `VITE_API_URL`

### Issue: "Invalid credentials"
- **Cause**: Wrong username or password
- **Fix**: Verify credentials, check for typos

### Issue: "Username already exists"
- **Cause**: User already registered
- **Fix**: Use different username or login

### Issue: "Token expired"
- **Cause**: Session expired
- **Fix**: Logout and login again (refresh should auto-handle)

### Issue: CORS errors
- **Cause**: Frontend origin not allowed
- **Fix**: Add origin to backend `CORS_ORIGIN`

## Migration from LocalStorage Auth

### Before:
- Users stored in localStorage
- Simple password hashing
- No backend communication
- No token refresh

### After:
- Users stored in backend database
- bcrypt password hashing
- JWT tokens with refresh
- Automatic token refresh
- Proper error handling

### Data Migration:
- Existing offline data is migrated on first login
- Meals, nutrition data, and settings preserved
- Old localStorage accounts not compatible

## Production Deployment

### Backend:
1. Set secure `JWT_SECRET`
2. Configure production database
3. Set `CORS_ORIGIN` to production domain
4. Enable HTTPS
5. Set appropriate token expiration times

### Frontend:
1. Update `VITE_API_URL` to production backend
2. Ensure HTTPS for all requests
3. Test token refresh in production
4. Monitor error rates

## Future Enhancements

1. **Email Verification**: Verify user email addresses
2. **Password Reset**: Forgot password flow
3. **Remember Me**: Extended session option
4. **Social Login**: OAuth providers (Google, Apple)
5. **Two-Factor Auth**: 2FA for security
6. **Session Management**: View/revoke active sessions
7. **Rate Limiting**: Prevent brute force attacks
8. **Account Deletion**: GDPR compliance

## Support

For issues or questions:
1. Check this guide first
2. Review backend logs
3. Check browser console for errors
4. Verify backend is accessible
5. Test endpoints with curl

## Summary

The authentication system is now fully integrated with the backend API, providing:
- ✅ Secure JWT-based authentication
- ✅ Automatic token refresh
- ✅ Proper error handling
- ✅ Offline data migration
- ✅ User profile management
- ✅ Secure password hashing
- ✅ Token revocation on logout
