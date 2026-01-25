/**
 * Authentication Test Utilities
 * Helper functions for testing authentication flows
 */

import * as authApi from '@/api/auth';
import { logger } from '@/utils/logger';

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
  logger.info('Testing registration...');
  results.register = await testRegister();
  logger.info(
    results.register.success
      ? 'Registration successful'
      : `Registration failed: ${results.register.error}`
  );

  if (!results.register.success) {
    return results;
  }

  // Test 2: Login with same credentials
  logger.info('Testing login...');
  results.login = await testLogin(
    results.register.testData.username,
    results.register.testData.password
  );
  logger.info(
    results.login.success
      ? 'Login successful'
      : `Login failed: ${results.login.error}`
  );

  // Test 3: Get current user
  logger.info('Testing get current user...');
  results.getCurrentUser = await testGetCurrentUser();
  logger.info(
    results.getCurrentUser.success
      ? `Get current user successful: ${results.getCurrentUser.user.username}`
      : `Get current user failed: ${results.getCurrentUser.error}`
  );

  // Test 4: Logout
  logger.info('Testing logout...');
  results.logout = await testLogout();
  logger.info(
    results.logout.success
      ? 'Logout successful'
      : `Logout failed: ${results.logout.error}`
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
  logger.info('Testing duplicate username...');
  const testData = generateTestData();
  await authApi.register(testData); // Register first user

  try {
    await authApi.register(testData); // Try to register again
    results.duplicateUser = { success: false, error: 'Expected error but got success' };
  } catch (error) {
    results.duplicateUser = { success: true, error };
  }
  logger.info(
    results.duplicateUser.success
      ? 'Duplicate username error handled correctly'
      : `Duplicate username test failed`
  );

  // Test 2: Invalid credentials
  logger.info('Testing invalid credentials...');
  try {
    await authApi.login({ username: 'nonexistentuser', password: 'wrongpassword' });
    results.invalidCredentials = { success: false, error: 'Expected error but got success' };
  } catch (error) {
    results.invalidCredentials = { success: true, error };
  }
  logger.info(
    results.invalidCredentials.success
      ? 'Invalid credentials error handled correctly'
      : `Invalid credentials test failed`
  );

  // Test 3: Short password (will be caught by client validation)
  logger.info('Testing short password...');
  try {
    await authApi.register({
      username: generateTestUsername(),
      password: 'short',
    });
    results.shortPassword = { success: false, error: 'Expected error but got success' };
  } catch (error) {
    results.shortPassword = { success: true, error };
  }
  logger.info(
    results.shortPassword.success
      ? 'Short password error handled correctly'
      : `Short password test failed`
  );

  return results;
}

/**
 * Run all tests
 */
export async function runAllTests() {
  logger.info('Starting Authentication Tests...\n');
  logger.info('=' .repeat(60));

  logger.info('\nTesting Complete Auth Flow:\n');
  logger.info('-'.repeat(60));
  const flowResults = await testCompleteAuthFlow();

  logger.info('\nTesting Error Scenarios:\n');
  logger.info('-'.repeat(60));
  const errorResults = await testErrorScenarios();

  logger.info('\n' + '='.repeat(60));
  logger.info('Tests Complete!\n');

  // Summary
  const flowSuccess = Object.values(flowResults).every((r) => r?.success);
  const errorSuccess = Object.values(errorResults).every((r) => r?.success);

  logger.info('Summary:');
  logger.info(`  Auth Flow: ${flowSuccess ? 'PASS' : 'FAIL'}`);
  logger.info(`  Error Handling: ${errorSuccess ? 'PASS' : 'FAIL'}`);

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
  logger.info('Auth test utilities available at window.authTest');
  logger.info('   Run tests with: authTest.runAllTests()');
}
