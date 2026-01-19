# Bellybook Authentication - Quick Start Guide

Get the authentication system up and running in 5 minutes.

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd /Users/kenshin/projects/Bellybook_backend
npm install
npm run start:dev
```

Expected output:
```
🚀 Application is running on: http://localhost:3000/api/v1
```

### 2. Start the Frontend

```bash
cd /Users/kenshin/projects/Bellybook_app
npm install
npm run dev
```

Open http://localhost:5173

### 3. Test the Authentication

**Option A: Using the UI**
1. Click "Register"
2. Enter username (min 3 chars)
3. Enter password (min 8 chars)
4. Click "Register"
5. You should be logged in automatically!

**Option B: Using Browser Console**
```javascript
// Open browser console and run:
authTest.runAllTests()
```

## 📝 Basic Usage

### Register a User

```typescript
import { useAuth } from '@/contexts/AuthContext';

function RegisterForm() {
  const { register } = useAuth();

  const handleRegister = async () => {
    try {
      const session = await register({
        username: 'myusername',
        password: 'mypassword123',
        displayName: 'My Name',
      });
      console.log('Registered!', session);
    } catch (error) {
      console.error('Registration failed:', error.message);
    }
  };

  return <button onClick={handleRegister}>Register</button>;
}
```

### Login a User

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const session = await login({
        username: 'myusername',
        password: 'mypassword123',
      });
      console.log('Logged in!', session);
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Check Authentication Status

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.displayName}!</div>;
}
```

### Logout

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    console.log('Logged out!');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## 🧪 Testing

### Test All Auth Flows

```javascript
// In browser console
authTest.runAllTests()
```

### Test Registration

```javascript
// In browser console
authTest.testRegister({
  username: 'testuser',
  password: 'password123',
  displayName: 'Test User'
})
```

### Test Login

```javascript
// In browser console
authTest.testLogin('testuser', 'password123')
```

### Test Error Scenarios

```javascript
// In browser console
authTest.testErrorScenarios()
```

## 🔧 Configuration

### Backend Environment Variables

Create `.env` in `/Users/kenshin/projects/Bellybook_backend`:

```bash
# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://localhost:5432/bellybook

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables

Create `.env` in `/Users/kenshin/projects/Bellybook_app`:

```bash
# Backend API
VITE_API_URL=http://localhost:3000/api/v1

# Gemini (for meal analysis)
VITE_GEMINI_API_KEY=your-key
```

## 📡 API Endpoints

### Register
```bash
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "displayName": "Test User"
}
```

### Login
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### Get Current User
```bash
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer <your-token>
```

### Logout
```bash
POST http://localhost:3000/api/v1/auth/logout
Authorization: Bearer <your-token>
```

### Refresh Token
```bash
POST http://localhost:3000/api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<your-refresh-token>"
}
```

## ❓ Troubleshooting

### "Network error"
**Problem**: Can't connect to backend

**Solution**:
1. Check backend is running: `cd /Users/kenshin/projects/Bellybook_backend && npm run start:dev`
2. Verify `VITE_API_URL` in `.env`
3. Check browser console for errors

### "Invalid credentials"
**Problem**: Wrong username or password

**Solution**:
1. Verify username and password are correct
2. Check for typos
3. Try registering a new account

### "Username already exists"
**Problem**: User already registered

**Solution**:
1. Use a different username
2. Or login with existing account

### Token expired
**Problem**: Session expired after 15 minutes

**Solution**:
- Token should refresh automatically
- If not, try logging out and logging back in

## 📚 Learn More

- **Complete Guide**: [COMPLETE_AUTH_GUIDE.md](./COMPLETE_AUTH_GUIDE.md)
- **API Reference**: [AUTHENTICATION_README.md](./AUTHENTICATION_README.md)
- **Deployment**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🎯 What's Next?

1. ✅ Get the system running
2. ✅ Test all auth flows
3. ✅ Read the complete guides
4. ✅ Customize for your needs
5. ✅ Deploy to production

---

**Need Help?** Check the browser console for detailed error messages and use the test utilities to debug.
