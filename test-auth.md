# Authentication API Integration Test Plan

## Backend API Endpoints

### 1. Register
- **URL**: `POST /auth/register`
- **Request Body**:
  ```json
  {
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com (optional)",
    "displayName": "Test User (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "user-id",
      "username": "testuser",
      "email": "test@example.com",
      "displayName": "Test User",
      "subscriptionTier": "FREE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 3600
  }
  ```

### 2. Login
- **URL**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```
- **Response**: Same as register

### 3. Logout
- **URL**: `POST /auth/logout`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

### 4. Get Current User
- **URL**: `GET /auth/me`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**:
  ```json
  {
    "id": "user-id",
    "username": "testuser",
    "email": "test@example.com",
    "displayName": "Test User",
    "subscriptionTier": "FREE",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
  ```

## Frontend Implementation

### Files Modified:
1. ✅ `/src/api/auth.ts` - New auth API client
2. ✅ `/src/services/authService.ts` - Updated to use backend API
3. ✅ `/src/contexts/AuthContext.tsx` - Made logout async
4. ✅ `/.env` - Added `VITE_API_URL=http://localhost:3000/api/v1`
5. ✅ `/src/api/index.ts` - Exported auth types

### Key Changes:
- Removed localStorage-based auth implementation
- Integrated with backend API endpoints
- JWT token management via `tokenManager`
- Automatic token refresh on 401 errors
- Proper error handling

## Testing Steps

1. **Start Backend Server**:
   ```bash
   cd /Users/kenshin/projects/Bellybook_backend
   npm run start:dev
   ```

2. **Start Frontend Dev Server**:
   ```bash
   cd /Users/kenshin/projects/Bellybook_app
   npm run dev
   ```

3. **Test Registration**:
   - Open app in browser
   - Navigate to registration
   - Enter: username "testuser2", password "password123"
   - Submit and verify successful registration

4. **Test Login**:
   - Logout if logged in
   - Enter: username "testuser2", password "password123"
   - Submit and verify successful login

5. **Test Logout**:
   - Click logout button
   - Verify tokens are cleared
   - Verify user is redirected to login

6. **Test Token Refresh**:
   - Login and wait for token to expire (or manually expire)
   - Make an API call
   - Verify token is refreshed automatically

## Validation Rules

### Registration:
- Username: min 3 characters, max 20 characters, alphanumeric + underscore only
- Password: min 8 characters, max 50 characters
- Email: optional, must be valid email format
- DisplayName: optional, min 1 character, max 50 characters

### Login:
- Username: required, min 1 character
- Password: required, min 1 character

## Error Handling

All errors are caught and displayed to the user via the UI. Common errors:
- "Username already exists" (409)
- "Invalid username or password" (401)
- "Username must be at least 3 characters" (400)
- "Password must be at least 8 characters" (400)
- Network errors (no connection)
