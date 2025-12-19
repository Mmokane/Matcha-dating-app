// ============================================
// TEST: Auth Endpoints
// Run with: node tests/test-auth-endpoints.js
// Comprehensive tests for all authentication endpoints
// ============================================

require('dotenv').config();
const http = require('http');

// Test configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_PREFIX = '/api/auth';

// Test data storage
let testData = {
  user: {
    email: `test_${Date.now()}@matcha.test`,
    username: `testuser_${Date.now()}`,
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User'
  },
  tokens: {
    verificationToken: null,
    resetToken: null,
    authToken: null
  }
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Helper function to make HTTP requests
const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add auth token if available
    if (testData.tokens.authToken) {
      options.headers['Authorization'] = `Bearer ${testData.tokens.authToken}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

// Test assertion helpers
const assertEqual = (actual, expected, message) => {
  testResults.total++;
  if (actual === expected) {
    console.log(`  ✅ ${message}`);
    testResults.passed++;
    return true;
  } else {
    console.log(`  ❌ ${message}`);
    console.log(`     Expected: ${expected}, Got: ${actual}`);
    testResults.failed++;
    return false;
  }
};

const assertStatus = (response, expectedStatus, message) => {
  return assertEqual(response.status, expectedStatus, message);
};

const assertProperty = (obj, property, message) => {
  testResults.total++;
  if (obj && obj.hasOwnProperty(property)) {
    console.log(`  ✅ ${message}`);
    testResults.passed++;
    return true;
  } else {
    console.log(`  ❌ ${message}`);
    console.log(`     Property '${property}' not found in response`);
    testResults.failed++;
    return false;
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// TEST SUITES
// ============================================

// Test 1: Register - Success
const testRegisterSuccess = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 1: POST /api/auth/register - Success');
  console.log('═════════════════════════════════════════════');

  try {
    const response = await makeRequest('POST', `${API_PREFIX}/register`, testData.user);
    
    assertStatus(response, 201, 'Returns 201 status code');
    assertEqual(response.body.status, 'success', 'Response status is "success"');
    assertProperty(response.body, 'data', 'Response contains data property');
    assertProperty(response.body.data, 'user', 'Data contains user object');
    assertProperty(response.body.data.user, 'id', 'User object contains id');
    assertEqual(response.body.data.user.email, testData.user.email, 'User email matches');
    assertEqual(response.body.data.user.username, testData.user.username, 'Username matches');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 2: Register - Duplicate Email
const testRegisterDuplicateEmail = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 2: POST /api/auth/register - Duplicate Email');
  console.log('═════════════════════════════════════════════');

  try {
    const duplicateUser = {
      ...testData.user,
      username: `newuser_${Date.now()}`
    };
    
    const response = await makeRequest('POST', `${API_PREFIX}/register`, duplicateUser);
    
    assertStatus(response, 400, 'Returns 400 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    assertProperty(response.body, 'message', 'Response contains error message');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 3: Register - Duplicate Username
const testRegisterDuplicateUsername = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 3: POST /api/auth/register - Duplicate Username');
  console.log('═════════════════════════════════════════════');

  try {
    const duplicateUser = {
      ...testData.user,
      email: `newemail_${Date.now()}@matcha.test`
    };
    
    const response = await makeRequest('POST', `${API_PREFIX}/register`, duplicateUser);
    
    assertStatus(response, 400, 'Returns 400 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    assertProperty(response.body, 'message', 'Response contains error message');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 4: Register - Missing Fields
const testRegisterMissingFields = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 4: POST /api/auth/register - Missing Required Fields');
  console.log('═════════════════════════════════════════════');

  try {
    const incompleteUser = {
      email: `incomplete_${Date.now()}@matcha.test`
      // Missing username, password, etc.
    };
    
    const response = await makeRequest('POST', `${API_PREFIX}/register`, incompleteUser);
    
    assertStatus(response, 400, 'Returns 400 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 5: Register - Invalid Email Format
const testRegisterInvalidEmail = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 5: POST /api/auth/register - Invalid Email Format');
  console.log('═════════════════════════════════════════════');

  try {
    const invalidUser = {
      ...testData.user,
      email: 'invalid-email-format',
      username: `newuser_${Date.now()}`
    };
    
    const response = await makeRequest('POST', `${API_PREFIX}/register`, invalidUser);
    
    assertStatus(response, 400, 'Returns 400 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 6: Register - Weak Password
const testRegisterWeakPassword = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 6: POST /api/auth/register - Weak Password');
  console.log('═════════════════════════════════════════════');

  try {
    const weakPasswordUser = {
      ...testData.user,
      email: `weak_${Date.now()}@matcha.test`,
      username: `weakuser_${Date.now()}`,
      password: '123'
    };
    
    const response = await makeRequest('POST', `${API_PREFIX}/register`, weakPasswordUser);
    
    assertStatus(response, 400, 'Returns 400 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 7: Login - Unverified Email
const testLoginUnverified = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 7: POST /api/auth/login - Unverified Email');
  console.log('═════════════════════════════════════════════');

  try {
    const loginData = {
      identifier: testData.user.email,
      password: testData.user.password
    };
    
    const response = await makeRequest('POST', `${API_PREFIX}/login`, loginData);
    
    assertStatus(response, 403, 'Returns 403 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    assertProperty(response.body, 'message', 'Response contains error message');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 8: Verify Email - Invalid Token
const testVerifyEmailInvalidToken = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 8: GET /api/auth/verify/:token - Invalid Token');
  console.log('═════════════════════════════════════════════');

  try {
    const invalidToken = 'invalid-token-123456';
    const response = await makeRequest('GET', `${API_PREFIX}/verify/${invalidToken}`);
    
    assertStatus(response, 400, 'Returns 400 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 9: Login - Invalid Credentials (Wrong Password)
const testLoginInvalidPassword = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 9: POST /api/auth/login - Invalid Password');
  console.log('═════════════════════════════════════════════');

  try {
    const loginData = {
      identifier: testData.user.email,
      password: 'WrongPassword123!'
    };
    
    const response = await makeRequest('POST', `${API_PREFIX}/login`, loginData);
    
    assertStatus(response, 401, 'Returns 401 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 10: Login - Non-existent User
const testLoginNonExistentUser = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 10: POST /api/auth/login - Non-existent User');
  console.log('═════════════════════════════════════════════');

  try {
    const loginData = {
      identifier: 'nonexistent@matcha.test',
      password: 'SomePassword123!'
    };
    
    const response = await makeRequest('POST', `${API_PREFIX}/login`, loginData);
    
    assertStatus(response, 401, 'Returns 401 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 11: Login - Missing Fields
const testLoginMissingFields = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 11: POST /api/auth/login - Missing Fields');
  console.log('═════════════════════════════════════════════');

  try {
    const loginData = {
      identifier: testData.user.email
      // Missing password
    };
    
    const response = await makeRequest('POST', `${API_PREFIX}/login`, loginData);
    
    assertStatus(response, 400, 'Returns 400 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 12: Forgot Password - Valid Email
const testForgotPasswordValid = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 12: POST /api/auth/forgot-password - Valid Email');
  console.log('═════════════════════════════════════════════');

  try {
    const response = await makeRequest('POST', `${API_PREFIX}/forgot-password`, {
      email: testData.user.email
    });
    
    assertStatus(response, 200, 'Returns 200 status code');
    assertEqual(response.body.status, 'success', 'Response status is "success"');
    assertProperty(response.body, 'message', 'Response contains message');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 13: Forgot Password - Non-existent Email
const testForgotPasswordNonExistent = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 13: POST /api/auth/forgot-password - Non-existent Email');
  console.log('═════════════════════════════════════════════');

  try {
    const response = await makeRequest('POST', `${API_PREFIX}/forgot-password`, {
      email: 'nonexistent@matcha.test'
    });
    
    // Should return success even for non-existent email (security best practice)
    assertStatus(response, 200, 'Returns 200 status code');
    assertEqual(response.body.status, 'success', 'Response status is "success"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 14: Forgot Password - Invalid Email Format
const testForgotPasswordInvalidFormat = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 14: POST /api/auth/forgot-password - Invalid Email Format');
  console.log('═════════════════════════════════════════════');

  try {
    const response = await makeRequest('POST', `${API_PREFIX}/forgot-password`, {
      email: 'invalid-email'
    });
    
    assertStatus(response, 400, 'Returns 400 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 15: Reset Password - Invalid Token
const testResetPasswordInvalidToken = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 15: POST /api/auth/reset-password - Invalid Token');
  console.log('═════════════════════════════════════════════');

  try {
    const response = await makeRequest('POST', `${API_PREFIX}/reset-password`, {
      token: 'invalid-reset-token',
      newPassword: 'NewPassword123!'
    });
    
    assertStatus(response, 400, 'Returns 400 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 16: Reset Password - Weak Password
const testResetPasswordWeak = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 16: POST /api/auth/reset-password - Weak Password');
  console.log('═════════════════════════════════════════════');

  try {
    const response = await makeRequest('POST', `${API_PREFIX}/reset-password`, {
      token: 'some-token',
      newPassword: '123'
    });
    
    assertStatus(response, 400, 'Returns 400 status code');
    assertEqual(response.body.status, 'error', 'Response status is "error"');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 17: Logout
const testLogout = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 17: POST /api/auth/logout - Logout');
  console.log('═════════════════════════════════════════════');

  try {
    const response = await makeRequest('POST', `${API_PREFIX}/logout`);
    
    assertStatus(response, 200, 'Returns 200 status code');
    assertEqual(response.body.status, 'success', 'Response status is "success"');
    assertProperty(response.body, 'message', 'Response contains message');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// Test 18: Login with Username (instead of email)
const testLoginWithUsername = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 18: POST /api/auth/login - Login with Username');
  console.log('═════════════════════════════════════════════');

  try {
    const loginData = {
      identifier: testData.user.username,
      password: testData.user.password
    };
    
    const response = await makeRequest('POST', `${API_PREFIX}/login`, loginData);
    
    // Should fail because email is not verified
    assertStatus(response, 403, 'Returns 403 status code (unverified)');
    
    console.log('\n  📋 Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// ============================================
// INTEGRATION TEST (Success Flow)
// ============================================

const testCompleteAuthFlow = async () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('Test 19: Complete Authentication Flow');
  console.log('═════════════════════════════════════════════');

  try {
    // Create a new user for this flow
    const flowUser = {
      email: `flow_${Date.now()}@matcha.test`,
      username: `flowuser_${Date.now()}`,
      password: 'FlowPassword123!',
      first_name: 'Flow',
      last_name: 'User'
    };

    console.log('\n  Step 1: Register new user');
    const registerResponse = await makeRequest('POST', `${API_PREFIX}/register`, flowUser);
    assertEqual(registerResponse.status, 201, 'Registration successful');

    console.log('\n  Step 2: Attempt login before verification');
    const loginBeforeVerify = await makeRequest('POST', `${API_PREFIX}/login`, {
      identifier: flowUser.email,
      password: flowUser.password
    });
    assertEqual(loginBeforeVerify.status, 403, 'Login blocked for unverified email');

    console.log('\n  Step 3: Request password reset');
    const forgotPasswordResponse = await makeRequest('POST', `${API_PREFIX}/forgot-password`, {
      email: flowUser.email
    });
    assertEqual(forgotPasswordResponse.status, 200, 'Password reset request successful');

    console.log('\n  ℹ️  Note: Complete flow requires database access for token verification');
    
  } catch (error) {
    console.log(`  ❌ Test failed with error: ${error.message}`);
    testResults.failed++;
    testResults.total++;
  }
};

// ============================================
// MAIN TEST RUNNER
// ============================================

const runAllTests = async () => {
  console.log('╔═════════════════════════════════════════════╗');
  console.log('║     MATCHA AUTH ENDPOINTS TEST SUITE        ║');
  console.log('╚═════════════════════════════════════════════╝');
  console.log(`\n🌐 Testing API: ${BASE_URL}${API_PREFIX}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

  try {
    // Registration Tests
    await testRegisterSuccess();
    await sleep(2000);
    await testRegisterDuplicateEmail();
    await sleep(2000);
    await testRegisterDuplicateUsername();
    await sleep(2000);
    await testRegisterMissingFields();
    await sleep(2000);
    await testRegisterInvalidEmail();
    await sleep(2000);
    await testRegisterWeakPassword();
    await sleep(2000);

    // Login Tests
    await testLoginUnverified();
    await sleep(2000);
    await testLoginInvalidPassword();
    await sleep(2000);
    await testLoginNonExistentUser();
    await sleep(2000);
    await testLoginMissingFields();
    await sleep(2000);
    await testLoginWithUsername();
    await sleep(2000);

    // Email Verification Tests
    await testVerifyEmailInvalidToken();
    await sleep(2000);

    // Password Reset Tests
    await testForgotPasswordValid();
    await sleep(2000);
    await testForgotPasswordNonExistent();
    await sleep(2000);
    await testForgotPasswordInvalidFormat();
    await sleep(2000);
    await testResetPasswordInvalidToken();
    await sleep(2000);
    await testResetPasswordWeak();
    await sleep(2000);

    // Logout Test
    await testLogout();
    await sleep(2000);

    // Integration Test
    await testCompleteAuthFlow();

  } catch (error) {
    console.log(`\n❌ Test suite failed with error: ${error.message}`);
    console.error(error);
  }

  // Print Summary
  console.log('\n\n╔═════════════════════════════════════════════╗');
  console.log('║            TEST RESULTS SUMMARY             ║');
  console.log('╚═════════════════════════════════════════════╝');
  console.log(`\n  Total Tests:  ${testResults.total}`);
  console.log(`  ✅ Passed:     ${testResults.passed}`);
  console.log(`  ❌ Failed:     ${testResults.failed}`);
  console.log(`  📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  console.log(`\n⏰ Completed at: ${new Date().toISOString()}\n`);

  // Exit with appropriate code
  process.exit(testResults.failed === 0 ? 0 : 1);
};

// Check if server is running before starting tests
const checkServer = async () => {
  console.log('🔍 Checking if server is running...\n');
  try {
    const response = await makeRequest('GET', '/');
    console.log('✅ Server is running!\n');
    return true;
  } catch (error) {
    console.log('❌ Server is not running!');
    console.log(`   Error: ${error.message}`);
    console.log(`\n   Please start the server first with: npm start`);
    console.log(`   Expected server at: ${BASE_URL}\n`);
    return false;
  }
};

// Run tests
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  } else {
    process.exit(1);
  }
})();
