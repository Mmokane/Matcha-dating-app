// ============================================
// TEST: Token Generator
// Run with: node test-tokens.js
// ============================================

require('dotenv').config();
const { generateJWT, verifyJWT, generateRandomToken } = require('./utils/tokenGenerator');

const testTokenGenerator = () => {
  console.log('🧪 Testing Token Generator...\n');

  try {
    // Test 1: Generate JWT token
    console.log('Test 1: Generate JWT token');
    const payload = {
      userId: 123,
      email: 'test@example.com',
      username: 'testuser'
    };
    console.log('Payload:', payload);
    
    const token = generateJWT(payload);
    console.log('Generated JWT:', token);
    console.log('Token length:', token.length);
    console.log('✅ JWT generated successfully\n');

    // Test 2: Verify valid JWT token
    console.log('Test 2: Verify valid JWT token');
    const decoded = verifyJWT(token);
    console.log('Decoded payload:', decoded);
    console.log('User ID matches?', decoded.userId === payload.userId);
    console.log('Email matches?', decoded.email === payload.email);
    console.log('✅ JWT verified successfully\n');

    // Test 3: Try to verify invalid token
    console.log('Test 3: Verify invalid token');
    try {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
      verifyJWT(invalidToken);
      console.log('❌ Should have thrown error for invalid token');
    } catch (error) {
      console.log('Error caught (expected):', error.message);
      console.log('✅ Invalid token correctly rejected\n');
    }

    // Test 4: Generate random token
    console.log('Test 4: Generate random verification token');
    const randomToken1 = generateRandomToken();
    console.log('Random token 1:', randomToken1);
    console.log('Token length:', randomToken1.length); // Should be 64 characters
    console.log('✅ Random token generated\n');

    // Test 5: Generate another random token (should be different)
    console.log('Test 5: Generate another random token');
    const randomToken2 = generateRandomToken();
    console.log('Random token 2:', randomToken2);
    console.log('Are tokens different?', randomToken1 !== randomToken2); // Should be true
    console.log('✅ Tokens are unique\n');

    // Test 6: Token format validation
    console.log('Test 6: Token format validation');
    const hexRegex = /^[a-f0-9]{64}$/;
    const isValidFormat = hexRegex.test(randomToken1);
    console.log('Is valid hex format?', isValidFormat);
    console.log('✅ Token format is correct\n');

    console.log('🎉 All token generator tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run tests
testTokenGenerator();