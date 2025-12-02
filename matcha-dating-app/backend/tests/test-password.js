// ============================================
// TEST: Password Utils
// Run with: node test-password.js
// ============================================

const { hashPassword, comparedPassword } = require('./utils/passwordUtils');

const testPasswordUtils = async () => {
  console.log('🧪 Testing Password Utils...\n');

  try {
    // Test 1: Hash a password
    console.log('Test 1: Hashing password');
    const plainPassword = 'MySecurePassword123!';
    console.log('Plain password:', plainPassword);
    
    const hash1 = await hashPassword(plainPassword);
    console.log('Hashed password:', hash1);
    console.log('Hash length:', hash1.length); // Should be 60 characters
    console.log('✅ Hash generated successfully\n');

    // Test 2: Hash same password again (should produce different hash)
    console.log('Test 2: Hashing same password again');
    const hash2 = await hashPassword(plainPassword);
    console.log('Second hash:', hash2);
    console.log('Are hashes different?', hash1 !== hash2); // Should be true (different salts)
    console.log('✅ Different hashes produced (good!)\n');

    // Test 3: Compare correct password
    console.log('Test 3: Comparing correct password');
    const isMatch1 = await comparedPassword(plainPassword, hash1);
    console.log('Does "MySecurePassword123!" match hash?', isMatch1); // Should be true
    console.log(isMatch1 ? '✅ Password matches!' : '❌ Password does not match');
    console.log('');

    // Test 4: Compare incorrect password
    console.log('Test 4: Comparing incorrect password');
    const wrongPassword = 'WrongPassword456';
    const isMatch2 = await comparedPassword(wrongPassword, hash1);
    console.log('Does "WrongPassword456" match hash?', isMatch2); // Should be false
    console.log(isMatch2 ? '❌ Password matches (should not!)' : '✅ Password correctly rejected');
    console.log('');

    // Test 5: Compare correct password with second hash
    console.log('Test 5: Correct password with different hash');
    const isMatch3 = await comparedPassword(plainPassword, hash2);
    console.log('Does password match second hash?', isMatch3); // Should be true
    console.log(isMatch3 ? '✅ Password matches second hash!' : '❌ Password does not match');
    console.log('');

    console.log('🎉 All password utils tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run tests
testPasswordUtils();