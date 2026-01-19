/**
 * Authentication Test Utilities
 * Helper functions for testing authentication flows
 */

import * as authApi from '@/api/auth';

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_CONFIG = {
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
};

// ============================================================================
// Test User Generator
// ============================================================================

/**
 * Generate a random test username
 */
export function generateTestUsername(prefix = 'testuser'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate test user data
 */
export function generateTestData(overrides?: {
  username?: string;
  password?: string;
  displayName?: string;
}) {
  return {
    username: overrides?.username || generateTestUsername(),
    password: overrides?.password || 'TestPassword123!',
    displayName: overrides?.displayName || 'Test User',
  };
}

// ============================================================================
// Test Functions
// ============================================================================

/**
 * Test user registration
 */
export async function testRegister(data?: {
  username?: string;
  password?: string;
  displayName?: string;
}) {
  const testData = generateTestData(data);

  try {
    const session = await authApi.register(testData);
    return {
      success: true,
      session,
      testData,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      session: null,
      testData,
      error,
    };
  }
}

/**
 * Test user login
 */
export async function testLogin(username: string, password: string) {
  try {
    const session = await authApi.login({ username, password });
    return {
      success: true,
      session,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      session: null,
      error,
    };
  }
}

/**
 * Test getting current user
 */
export async function testGetCurrentUser() {
  try {
    const user = await authApi.getCurrentUser();
    return {
      success: true,
      user,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      user: null,
      error,
    };
  }
}

/**
 * Test logout
 */
export async function testLogout() {
  try {
    await authApi.logout();
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}

/**
 * Test complete auth flow
 */
export async function testCompleteAuthFlow() {
  const results = {
    register: null as any,
    login: null as any,
    getCurrentUser: null as any,
    logout: null as any,
  };

  // Test 1: Register
  console.log('📝 Testing registration...');
  results.register = await testRegister();
  console.log(
    results.register.success
      ? '✅ Registration successful'
      : `❌ Registration failed: ${results.register.error}`
  );

  if (!results.register.success) {
    return results;
  }

  // Test 2: Login with same credentials
  console.log('🔐 Testing login...');
  results.login = await testLogin(
    results.register.testData.username,
    results.register.testData.password
  );
  console.log(
    results.login.success
      ? '✅ Login successful'
      : `❌ Login failed: ${results.login.error}`
  );

  // Test 3: Get current user
  console.log('👤 Testing get current user...');
  results.getCurrentUser = await testGetCurrentUser();
  console.log(
    results.getCurrentUser.success
      ? `✅ Get current user successful: ${results.getCurrentUser.user.username}`
      : `❌ Get current user failed: ${results.getCurrentUser.error}`
  );

  // Test 4: Logout
  console.log('🚪 Testing logout...');
  results.logout = await testLogout();
  console.log(
    results.logout.success
      ? '✅ Logout successful'
      : `❌ Logout failed: ${results.logout.error}`
  );

  return results;
}

/**
 * Test error scenarios
 */
export async function testErrorScenarios() {
  const results = {
    duplicateUser: null as any,
    invalidCredentials: null as any,
    shortPassword: null as any,
  };

  // Test 1: Duplicate username
  console.log('📝 Testing duplicate username...');
  const testData = generateTestData();
  await authApi.register(testData); // Register first user

  try {
    await authApi.register(testData); // Try to register again
    results.duplicateUser = { success: false, error: 'Expected error but got success' };
  } catch (error) {
    results.duplicateUser = { success: true, error };
  }
  console.log(
    results.duplicateUser.success
      ? '✅ Duplicate username error handled correctly'
      : `❌ Duplicate username test failed`
  );

  // Test 2: Invalid credentials
  console.log('🔐 Testing invalid credentials...');
  try {
    await authApi.login({ username: 'nonexistentuser', password: 'wrongpassword' });
    results.invalidCredentials = { success: false, error: 'Expected error but got success' };
  } catch (error) {
    results.invalidCredentials = { success: true, error };
  }
  console.log(
    results.invalidCredentials.success
      ? '✅ Invalid credentials error handled correctly'
      : `❌ Invalid credentials test failed`
  );

  // Test 3: Short password (will be caught by client validation)
  console.log('🔏 Testing short password...');
  try {
    await authApi.register({
      username: generateTestUsername(),
      password: 'short',
    });
    results.shortPassword = { success: false, error: 'Expected error but got success' };
  } catch (error) {
    results.shortPassword = { success: true, error };
  }
  console.log(
    results.shortPassword.success
      ? '✅ Short password error handled correctly'
      : `❌ Short password test failed`
  );

  return results;
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🧪 Starting Authentication Tests...\n');
  console.log('=' .repeat(60));

  console.log('\n📋 Testing Complete Auth Flow:\n');
  console.log('-'.repeat(60));
  const flowResults = await testCompleteAuthFlow();

  console.log('\n📋 Testing Error Scenarios:\n');
  console.log('-'.repeat(60));
  const errorResults = await testErrorScenarios();

  console.log('\n' + '='.repeat(60));
  console.log('🧪 Tests Complete!\n');

  // Summary
  const flowSuccess = Object.values(flowResults).every((r) => r?.success);
  const errorSuccess = Object.values(errorResults).every((r) => r?.success);

  console.log('📊 Summary:');
  console.log(`  Auth Flow: ${flowSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Error Handling: ${errorSuccess ? '✅ PASS' : '❌ FAIL'}`);

  return {
    flowResults,
    errorResults,
    success: flowSuccess && errorSuccess,
  };
}

// ============================================================================
// Console Export (for browser testing)
// ============================================================================

if (typeof window !== 'undefined') {
  (window as any).authTest = {
    generateTestUsername,
    generateTestData,
    testRegister,
    testLogin,
    testGetCurrentUser,
    testLogout,
    testCompleteAuthFlow,
    testErrorScenarios,
    runAllTests,
  };
  console.log('🧪 Auth test utilities available at window.authTest');
  console.log('   Run tests with: authTest.runAllTests()');
}
