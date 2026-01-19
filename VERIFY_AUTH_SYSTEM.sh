#!/bin/bash

# Bellybook Authentication System Verification Script
# This script verifies that the authentication system is properly configured

set -e

echo "🔍 Bellybook Authentication System Verification"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  WARNING${NC}: $1"
    ((WARNINGS++))
}

echo "📋 Checking Backend Configuration..."
echo "-----------------------------------"

# Check if backend directory exists
if [ -d "/Users/kenshin/projects/Bellybook_backend" ]; then
    print_result 0 "Backend directory exists"
else
    print_result 1 "Backend directory not found"
fi

# Check backend auth controller
if [ -f "/Users/kenshin/projects/Bellybook_backend/src/modules/auth/auth.controller.ts" ]; then
    print_result 0 "Backend auth controller exists"

    # Check for refresh endpoint
    if grep -q "refresh" "/Users/kenshin/projects/Bellybook_backend/src/modules/auth/auth.controller.ts"; then
        print_result 0 "Backend refresh endpoint implemented"
    else
        print_result 1 "Backend refresh endpoint missing"
    fi
else
    print_result 1 "Backend auth controller not found"
fi

# Check backend auth service
if [ -f "/Users/kenshin/projects/Bellybook_backend/src/modules/auth/auth.service.ts" ]; then
    print_result 0 "Backend auth service exists"

    # Check for refreshTokens method
    if grep -q "refreshTokens" "/Users/kenshin/projects/Bellybook_backend/src/modules/auth/auth.service.ts"; then
        print_result 0 "Backend refreshTokens method implemented"
    else
        print_result 1 "Backend refreshTokens method missing"
    fi
else
    print_result 1 "Backend auth service not found"
fi

echo ""
echo "📋 Checking Frontend Configuration..."
echo "-------------------------------------"

# Check if we're in the correct directory
if [ -f "./src/api/auth.ts" ]; then
    print_result 0 "Frontend auth API client exists"
else
    print_result 1 "Frontend auth API client missing"
    echo "Please run this script from the Bellybook_app directory"
    exit 1
fi

# Check for error types
if [ -f "./src/api/errors.ts" ]; then
    print_result 0 "Error types module exists"
else
    print_result 1 "Error types module missing"
fi

# Check for offline support
if [ -f "./src/api/offlineFallback.ts" ]; then
    print_result 0 "Offline fallback module exists"
else
    print_result 1 "Offline fallback module missing"
fi

# Check for performance utilities
if [ -f "./src/api/performance.ts" ]; then
    print_result 0 "Performance utilities module exists"
else
    print_result 1 "Performance utilities module missing"
fi

# Check auth service
if [ -f "./src/services/authService.ts" ]; then
    print_result 0 "Auth service exists"

    # Check if it's using backend API
    if grep -q "authApi" "./src/services/authService.ts"; then
        print_result 0 "Auth service uses backend API"
    else
        print_result 1 "Auth service not using backend API"
    fi

    # Check no localStorage user storage
    if ! grep -q "bellybook_users" "./src/services/authService.ts"; then
        print_result 0 "No localStorage user storage (good)"
    else
        print_result 1 "Still using localStorage for users"
    fi
else
    print_result 1 "Auth service missing"
fi

echo ""
echo "📋 Checking Documentation..."
echo "----------------------------"

docs=(
    "QUICKSTART.md"
    "AUTHENTICATION_README.md"
    "COMPLETE_AUTH_GUIDE.md"
    "DEPLOYMENT_CHECKLIST.md"
    "IMPLEMENTATION_COMPLETE.md"
)

for doc in "${docs[@]}"; do
    if [ -f "./$doc" ]; then
        print_result 0 "$doc exists"
    else
        print_warning "$doc missing"
    fi
done

echo ""
echo "📋 Checking Environment Configuration..."
echo "-----------------------------------------"

# Check .env file
if [ -f "./.env" ]; then
    print_result 0 ".env file exists"

    # Check for API URL
    if grep -q "VITE_API_URL" "./.env"; then
        API_URL=$(grep "VITE_API_URL" "./.env" | cut -d '=' -f2)
        print_result 0 "VITE_API_URL configured: $API_URL"

        # Check if it's localhost (warn for production)
        if [[ "$API_URL" == *"localhost"* ]]; then
            print_warning "Using localhost - remember to change for production"
        fi
    else
        print_result 1 "VITE_API_URL not configured"
    fi
else
    print_result 1 ".env file missing"
fi

echo ""
echo "📋 Checking Build Status..."
echo "----------------------------"

# Check if node_modules exists
if [ -d "./node_modules" ]; then
    print_result 0 "Dependencies installed"
else
    print_warning "Dependencies not installed - run 'npm install'"
fi

# Check if dist exists
if [ -d "./dist" ]; then
    print_result 0 "Build output exists"

    # Check build size
    BUILD_SIZE=$(du -sh ./dist | cut -f1)
    echo "   📦 Build size: $BUILD_SIZE"
else
    print_warning "Build output not found - run 'npm run build'"
fi

echo ""
echo "📋 Checking Test Utilities..."
echo "-------------------------------"

# Check for test utilities
if [ -f "./src/utils/authTest.ts" ]; then
    print_result 0 "Test utilities exist"
else
    print_result 1 "Test utilities missing"
fi

echo ""
echo "📋 Summary"
echo "----------"
echo -e "${GREEN}Passed${NC}: $PASSED"
echo -e "${RED}Failed${NC}: $FAILED"
echo -e "${YELLOW}Warnings${NC}: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the backend: cd /Users/kenshin/projects/Bellybook_backend && npm run start:dev"
    echo "2. Start the frontend: npm run dev"
    echo "3. Test in browser: Open console and run 'authTest.runAllTests()'"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi
