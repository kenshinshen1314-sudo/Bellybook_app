# Bellybook Authentication System - Deployment Checklist

## 🚀 Pre-Deployment Checklist

### Backend Preparation (`/Users/kenshin/projects/Bellybook_backend`)

- [ ] **Environment Variables**
  - [ ] Set secure `JWT_SECRET` (use strong random string, min 32 chars)
  - [ ] Configure `DATABASE_URL` for production database
  - [ ] Set `CORS_ORIGIN` to production frontend domain
  - [ ] Configure `JWT_EXPIRES_IN` (recommend: 15m)
  - [ ] Configure `REFRESH_TOKEN_EXPIRES_IN` (recommend: 7d)
  - [ ] Set `PORT` (recommend: 3000 or 8080)

- [ ] **Database**
  - [ ] Run database migrations
  - [ ] Verify database connection
  - [ ] Check database indexes (users table, refresh_tokens table)
  - [ ] Set up database backups

- [ ] **Security**
  - [ ] Enable HTTPS
  - [ ] Configure firewall rules
  - [ ] Set up rate limiting
  - [ ] Enable request logging
  - [ ] Configure CORS properly
  - [ ] Review and update security headers

- [ ] **Testing**
  - [ ] Test all auth endpoints
  - [ ] Test token refresh flow
  - [ ] Test error handling
  - [ ] Test with production database
  - [ ] Load test auth endpoints

### Frontend Preparation (`/Users/kenshin/projects/Bellybook_app`)

- [ ] **Environment Variables**
  - [ ] Set `VITE_API_URL` to production backend URL
  - [ ] Set `VITE_GEMINI_API_KEY` if needed
  - [ ] Remove any development-only variables

- [ ] **Build**
  - [ ] Run `npm run build`
  - [ ] Verify build succeeds
  - [ ] Check build output size
  - [ ] Test production build locally
  - [ ] Verify PWA service worker

- [ ] **Testing**
  - [ ] Test registration flow
  - [ ] Test login flow
  - [ ] Test logout flow
  - [ ] Test token refresh (wait 15 min or manually expire)
  - [ ] Test error scenarios (network errors, invalid credentials)
  - [ ] Test offline data migration
  - [ ] Test on mobile devices
  - [ ] Test in different browsers

- [ ] **Performance**
  - [ ] Check bundle size
  - [ ] Optimize images
  - [ ] Enable compression
  - [ ] Configure CDN
  - [ ] Test loading times

---

## 📋 Deployment Steps

### 1. Backend Deployment

```bash
cd /Users/kenshin/projects/Bellybook_backend

# Install dependencies
npm ci --production

# Run database migrations
npm run migrate

# Build (if using TypeScript)
npm run build

# Start production server
npm run start:prod
```

**Verify Backend:**
```bash
# Health check
curl https://your-backend.com/api/v1/auth/me

# Test registration
curl -X POST https://your-backend.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### 2. Frontend Deployment

```bash
cd /Users/kenshin/projects/Bellybook_app

# Create production build
npm run build

# Deploy dist/ folder to your hosting
# - Netlify: drag and drop dist/ folder
# - Vercel: connect repository
# - AWS S3: sync dist/ to S3 bucket
# - Custom server: copy dist/ to web root
```

**Verify Frontend:**
- [ ] Open production URL
- [ ] Check browser console for errors
- [ ] Test registration
- [ ] Test login
- [ ] Check network tab for API calls
- [ ] Verify HTTPS is working
- [ ] Test on mobile device

---

## 🔍 Post-Deployment Verification

### Backend Health Checks

```bash
# Check if backend is running
curl -I https://your-backend.com/api/v1

# Check auth endpoint
curl https://your-backend.com/api/v1/auth/me

# Should return 401 Unauthorized (endpoint is protected)
```

### Frontend Health Checks

1. **Browser Console**
   - [ ] No JavaScript errors
   - [ ] API calls are being made to correct URL
   - [ ] Tokens are stored in localStorage
   - [ ] Service worker is active

2. **Network Tab**
   - [ ] API calls succeed (200 status)
   - [ ] Auth headers are sent
   - [ ] Token refresh works on 401
   - [ ] No CORS errors

3. **Application Tests**
   - [ ] Register new user
   - [ ] Login with new user
   - [ ] Access protected routes
   - [ ] Logout
   - [ ] Login again
   - [ ] Refresh page (stay logged in)

---

## ⚠️ Common Issues & Solutions

### Issue: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- API calls fail

**Solution:**
1. Check backend `CORS_ORIGIN` environment variable
2. Add frontend domain to allowed origins
3. Restart backend server

### Issue: Token Not Refreshing

**Symptoms:**
- User logged out after 15 minutes
- 401 errors not handled

**Solution:**
1. Check if `/auth/refresh` endpoint is accessible
2. Verify refresh token is stored in localStorage
3. Check browser console for errors
4. Verify backend refresh token logic

### Issue: Network Errors

**Symptoms:**
- "Network error" messages
- API calls timeout

**Solution:**
1. Check if backend is running
2. Verify `VITE_API_URL` is correct
3. Check network connection
4. Verify firewall rules
5. Check backend logs

### Issue: Build Errors

**Symptoms:**
- Build fails
- Type errors

**Solution:**
1. Run `npm install`
2. Clear node_modules and reinstall
3. Check TypeScript version
4. Review error messages

---

## 🔐 Security Checklist

### Backend Security

- [ ] JWT_SECRET is strong and unique
- [ ] Database connection uses SSL
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Input validation is enabled
- [ ] Passwords are hashed with bcrypt
- [ ] Refresh tokens are revoked on logout
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] Logging is enabled (but not sensitive data)

### Frontend Security

- [ ] No sensitive data in localStorage except tokens
- [ ] API_URL uses HTTPS
- [ ] No hardcoded credentials
- [ ] CSP headers are configured
- [ ] XSS protection is enabled
- [ ] Dependencies are up to date

---

## 📊 Monitoring & Maintenance

### Setup Monitoring

- [ ] Backend error tracking (e.g., Sentry)
- [ ] Frontend error tracking
- [ ] API response time monitoring
- [ ] Database performance monitoring
- [ ] User authentication metrics
- [ ] Failed login alerts

### Regular Maintenance

- [ ] Weekly: Check error logs
- [ ] Weekly: Review failed authentication attempts
- [ ] Monthly: Rotate JWT_SECRET (with careful rollout)
- [ ] Monthly: Review and update dependencies
- [ ] Monthly: Check database storage
- [ ] Quarterly: Security audit
- [ ] Quarterly: Load testing

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] **Registration**
  - Valid username/password
  - Duplicate username
  - Short password
  - Invalid email format

- [ ] **Login**
  - Valid credentials
  - Invalid username
  - Invalid password
  - Empty fields

- [ ] **Token Refresh**
  - Wait for token expiry
  - Make API request
  - Verify automatic refresh

- [ ] **Logout**
  - Click logout button
  - Verify tokens cleared
  - Verify redirect to login

- [ ] **Network Scenarios**
  - Slow network
  - Offline mode
  - Network timeout

### Automated Testing

```bash
# Run browser console tests
open https://your-app.com
# In console:
authTest.runAllTests()
```

---

## 📝 Configuration Files

### Backend `.env` Example

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your-super-secret-random-string-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend.com

# Redis (if using)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend `.env` Example

```bash
# Backend API
VITE_API_URL=https://your-backend.com/api/v1

# Gemini API
VITE_GEMINI_API_KEY=your-key
VITE_DISHES_ANALYSIS_NUM=10
```

---

## ✅ Final Verification

Before going live:

- [ ] All tests pass
- [ ] No console errors
- [ ] Backend is accessible
- [ ] Frontend loads correctly
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Token refresh works
- [ ] HTTPS is enabled
- [ ] Monitoring is set up
- [ ] Backups are configured
- [ ] Team is notified

---

## 🎯 Success Criteria

The authentication system is successfully deployed when:

- ✅ Users can register new accounts
- ✅ Users can login with valid credentials
- ✅ Users stay logged in across page refreshes
- ✅ Tokens refresh automatically
- ✅ Logout clears all session data
- ✅ Error messages are user-friendly
- ✅ No console errors
- ✅ Works on all target browsers
- ✅ Works on mobile devices
- ✅ Performance is acceptable (< 2s for auth operations)

---

## 📞 Support Contacts

- Backend Lead: [Contact]
- Frontend Lead: [Contact]
- DevOps: [Contact]

---

## 📚 Additional Resources

- **Documentation**: `AUTHENTICATION_README.md`
- **Complete Guide**: `COMPLETE_AUTH_GUIDE.md`
- **Test Utilities**: `src/utils/authTest.ts`
- **Error Types**: `src/api/errors.ts`

---

**Last Updated**: 2024-01-18
**Version**: 1.0.0
**Status**: Ready for Deployment ✅
