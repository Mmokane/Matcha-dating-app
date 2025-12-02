// ============================================
// TEST: Validation Middleware
// Run with: node test-validation.js
// Tests input validation rules
// ============================================

const express = require('express');
const {
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  handleValidationErrors
} = require('./middleware/validation');

const app = express();
app.use(express.json());

console.log('🧪 Testing Validation Middleware...\n');

// Test routes to validate different inputs
app.post('/test/register', validateRegistration, handleValidationErrors, (req, res) => {
  res.json({ status: 'success', message: 'Registration data is valid!' });
});

app.post('/test/login', validateLogin, handleValidationErrors, (req, res) => {
  res.json({ status: 'success', message: 'Login data is valid!' });
});

app.post('/test/reset-request', validatePasswordResetRequest, handleValidationErrors, (req, res) => {
  res.json({ status: 'success', message: 'Reset request data is valid!' });
});

app.post('/test/reset', validatePasswordReset, handleValidationErrors, (req, res) => {
  res.json({ status: 'success', message: 'Reset data is valid!' });
});

// Start server
const PORT = 3001;
const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}\n`);
  runTests();
});

// Helper function to make test requests
const testRequest = async (endpoint, data, testName) => {
  try {
    const response = await fetch(`http://localhost:${PORT}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    console.log(`${testName}:`);
    console.log('  Status:', response.status);
    console.log('  Response:', JSON.stringify(result, null, 2));
    console.log('');
    
    return { status: response.status, data: result };
  } catch (error) {
    console.error(`❌ ${testName} failed:`, error.message);
    console.log('');
    return null;
  }
};

// Run all validation tests
const runTests = async () => {
  console.log('═════════════════════════════════════════════');
  console.log('        VALIDATION MIDDLEWARE TESTS');
  console.log('═════════════════════════════════════════════\n');
  
  // ===== REGISTRATION TESTS =====
  console.log('─────────────────────────────────────────────');
  console.log('REGISTRATION VALIDATION TESTS');
  console.log('─────────────────────────────────────────────\n');
  
  // Test 1: Valid registration data
  await testRequest('/test/register', {
    email: 'test@example.com',
    username: 'testuser123',
    password: 'SecurePass123',
    first_name: 'John',
    last_name: 'Doe'
  }, '✅ Test 1: Valid registration data');
  
  // Test 2: Invalid email
  await testRequest('/test/register', {
    email: 'not-an-email',
    username: 'testuser123',
    password: 'SecurePass123',
    first_name: 'John',
    last_name: 'Doe'
  }, '❌ Test 2: Invalid email format');
  
  // Test 3: Weak password (no uppercase)
  await testRequest('/test/register', {
    email: 'test@example.com',
    username: 'testuser123',
    password: 'weakpass123',
    first_name: 'John',
    last_name: 'Doe'
  }, '❌ Test 3: Weak password (no uppercase)');
  
  // Test 4: Weak password (no number)
  await testRequest('/test/register', {
    email: 'test@example.com',
    username: 'testuser123',
    password: 'WeakPassword',
    first_name: 'John',
    last_name: 'Doe'
  }, '❌ Test 4: Weak password (no number)');
  
  // Test 5: Short password
  await testRequest('/test/register', {
    email: 'test@example.com',
    username: 'testuser123',
    password: 'Pass1',
    first_name: 'John',
    last_name: 'Doe'
  }, '❌ Test 5: Password too short');
  
  // Test 6: Invalid username (special characters)
  await testRequest('/test/register', {
    email: 'test@example.com',
    username: 'test@user!',
    password: 'SecurePass123',
    first_name: 'John',
    last_name: 'Doe'
  }, '❌ Test 6: Invalid username (special chars)');
  
  // Test 7: Username too short
  await testRequest('/test/register', {
    email: 'test@example.com',
    username: 'ab',
    password: 'SecurePass123',
    first_name: 'John',
    last_name: 'Doe'
  }, '❌ Test 7: Username too short');
  
  // Test 8: Missing first name
  await testRequest('/test/register', {
    email: 'test@example.com',
    username: 'testuser123',
    password: 'SecurePass123',
    first_name: '',
    last_name: 'Doe'
  }, '❌ Test 8: Missing first name');
  
  // ===== LOGIN TESTS =====
  console.log('─────────────────────────────────────────────');
  console.log('LOGIN VALIDATION TESTS');
  console.log('─────────────────────────────────────────────\n');
  
  // Test 9: Valid login data
  await testRequest('/test/login', {
    identifier: 'testuser',
    password: 'password123'
  }, '✅ Test 9: Valid login data');
  
  // Test 10: Missing identifier
  await testRequest('/test/login', {
    identifier: '',
    password: 'password123'
  }, '❌ Test 10: Missing identifier');
  
  // Test 11: Missing password
  await testRequest('/test/login', {
    identifier: 'testuser',
    password: ''
  }, '❌ Test 11: Missing password');
  
  // ===== PASSWORD RESET REQUEST TESTS =====
  console.log('─────────────────────────────────────────────');
  console.log('PASSWORD RESET REQUEST TESTS');
  console.log('─────────────────────────────────────────────\n');
  
  // Test 12: Valid reset request
  await testRequest('/test/reset-request', {
    email: 'test@example.com'
  }, '✅ Test 12: Valid reset request');
  
  // Test 13: Invalid email
  await testRequest('/test/reset-request', {
    email: 'not-an-email'
  }, '❌ Test 13: Invalid email format');
  
  // ===== PASSWORD RESET TESTS =====
  console.log('─────────────────────────────────────────────');
  console.log('PASSWORD RESET TESTS');
  console.log('─────────────────────────────────────────────\n');
  
  // Test 14: Valid reset data
  await testRequest('/test/reset', {
    token: 'a'.repeat(64), // 64 character token
    newPassword: 'NewSecurePass123'
  }, '✅ Test 14: Valid reset data');
  
  // Test 15: Invalid token length
  await testRequest('/test/reset', {
    token: 'shorttoken',
    newPassword: 'NewSecurePass123'
  }, '❌ Test 15: Invalid token length');
  
  // Test 16: Weak new password
  await testRequest('/test/reset', {
    token: 'a'.repeat(64),
    newPassword: 'weak'
  }, '❌ Test 16: Weak new password');
  
  // Summary
  console.log('═════════════════════════════════════════════');
  console.log('             TEST COMPLETE');
  console.log('═════════════════════════════════════════════');
  console.log('');
  console.log('✅ = Should pass validation');
  console.log('❌ = Should fail validation (expected)');
  console.log('');
  console.log('Review the responses above to verify:');
  console.log('  - Valid data returns status 200');
  console.log('  - Invalid data returns status 400 with error details');
  console.log('');
  
  // Close server
  server.close();
  process.exit(0);
};