// ============================================
// TEST: User Model
// Run with: node test-user-model.js
// Tests all user database operations
// ============================================

require('dotenv').config({path: '../.env'});
const {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  findUserByVerificationToken,
  findUserByResetToken,
  updateVerificationStatus,
  updatePassword,
  updateResetToken,
  clearResetToken,
  updateLastLogin,
  updateOnlineStatus
} = require('../models/userModel');

const { hashPassword } = require('../utils/passwordUtils');
const { generateRandomToken } = require('../utils/tokenGenerator');

// Test data
let testUserId = null;
const testEmail = `test_${Date.now()}@example.com`; // Unique email
const testUsername = `testuser_${Date.now()}`; // Unique username

console.log('🧪 Testing User Model...\n');

// Test 1: Create User
const testCreateUser = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 1: Create User');
  console.log('─────────────────────────────────────────────');
  
  try {
    const hashedPassword = await hashPassword('TestPassword123!');
    const verificationToken = generateRandomToken();
    
    const userData = {
      email: testEmail,
      username: testUsername,
      password_hash: hashedPassword,
      first_name: 'Test',
      last_name: 'User',
      verification_token: verificationToken
    };
    
    console.log('Creating user with:');
    console.log('  Email:', userData.email);
    console.log('  Username:', userData.username);
    console.log('  Name:', userData.first_name, userData.last_name);
    
    const user = await createUser(userData);
    testUserId = user.id;
    
    console.log('✅ User created successfully!');
    console.log('  User ID:', user.id);
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Test 2: Find User by Email
const testFindUserByEmail = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 2: Find User by Email');
  console.log('─────────────────────────────────────────────');
  
  try {
    console.log('Searching for:', testEmail);
    
    const user = await findUserByEmail(testEmail);
    
    if (user) {
      console.log('✅ User found!');
      console.log('  ID:', user.id);
      console.log('  Username:', user.username);
      console.log('  Verified:', user.verified);
      console.log('');
      return true;
    } else {
      console.log('❌ User not found');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Test 3: Find User by Username
const testFindUserByUsername = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 3: Find User by Username');
  console.log('─────────────────────────────────────────────');
  
  try {
    console.log('Searching for:', testUsername);
    
    const user = await findUserByUsername(testUsername);
    
    if (user) {
      console.log('✅ User found!');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('');
      return true;
    } else {
      console.log('❌ User not found');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Test 4: Find User by ID
const testFindUserById = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 4: Find User by ID');
  console.log('─────────────────────────────────────────────');
  
  try {
    console.log('Searching for ID:', testUserId);
    
    const user = await findUserById(testUserId);
    
    if (user) {
      console.log('✅ User found!');
      console.log('  Email:', user.email);
      console.log('  Username:', user.username);
      console.log('');
      return true;
    } else {
      console.log('❌ User not found');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Test 5: Find User by Verification Token
const testFindUserByVerificationToken = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 5: Find User by Verification Token');
  console.log('─────────────────────────────────────────────');
  
  try {
    // Get user to retrieve their verification token
    const user = await findUserById(testUserId);
    const token = user.verification_token;
    
    console.log('Searching with token:', token.substring(0, 20) + '...');
    
    const foundUser = await findUserByVerificationToken(token);
    
    if (foundUser) {
      console.log('✅ User found by verification token!');
      console.log('  Email:', foundUser.email);
      console.log('');
      return true;
    } else {
      console.log('❌ User not found');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Test 6: Update Verification Status
const testUpdateVerificationStatus = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 6: Update Verification Status');
  console.log('─────────────────────────────────────────────');
  
  try {
    console.log('Verifying user ID:', testUserId);
    
    const success = await updateVerificationStatus(testUserId);
    
    if (success) {
      // Check if it worked
      const user = await findUserById(testUserId);
      console.log('✅ Verification status updated!');
      console.log('  Verified:', user.verified);
      console.log('  Token cleared:', user.verification_token === null);
      console.log('');
      return true;
    } else {
      console.log('❌ Update failed');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Test 7: Update Password
const testUpdatePassword = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 7: Update Password');
  console.log('─────────────────────────────────────────────');
  
  try {
    const newPassword = 'NewSecurePassword456!';
    const hashedPassword = await hashPassword(newPassword);
    
    console.log('Updating password for user ID:', testUserId);
    
    const success = await updatePassword(testUserId, hashedPassword);
    
    if (success) {
      console.log('✅ Password updated successfully!');
      console.log('');
      return true;
    } else {
      console.log('❌ Update failed');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Test 8: Update Reset Token
const testUpdateResetToken = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 8: Update Reset Token');
  console.log('─────────────────────────────────────────────');
  
  try {
    const resetToken = generateRandomToken();
    
    console.log('Setting reset token for:', testEmail);
    console.log('Token:', resetToken.substring(0, 20) + '...');
    
    const success = await updateResetToken(testEmail, resetToken);
    
    if (success) {
      console.log('✅ Reset token updated!');
      console.log('');
      return resetToken; // Return for next test
    } else {
      console.log('❌ Update failed');
      console.log('');
      return null;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return null;
  }
};

// Test 9: Find User by Reset Token
const testFindUserByResetToken = async (resetToken) => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 9: Find User by Reset Token');
  console.log('─────────────────────────────────────────────');
  
  try {
    console.log('Searching with token:', resetToken.substring(0, 20) + '...');
    
    const user = await findUserByResetToken(resetToken);
    
    if (user) {
      console.log('✅ User found by reset token!');
      console.log('  Email:', user.email);
      console.log('  Token expires:', user.reset_token_expires);
      console.log('');
      return true;
    } else {
      console.log('❌ User not found or token expired');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Test 10: Clear Reset Token
const testClearResetToken = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 10: Clear Reset Token');
  console.log('─────────────────────────────────────────────');
  
  try {
    console.log('Clearing reset token for user ID:', testUserId);
    
    const success = await clearResetToken(testUserId);
    
    if (success) {
      // Verify it was cleared
      const user = await findUserById(testUserId);
      console.log('✅ Reset token cleared!');
      console.log('  Token is null:', user.reset_token === null);
      console.log('');
      return true;
    } else {
      console.log('❌ Clear failed');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Test 11: Update Last Login
const testUpdateLastLogin = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 11: Update Last Login');
  console.log('─────────────────────────────────────────────');
  
  try {
    console.log('Updating last login for user ID:', testUserId);
    
    const success = await updateLastLogin(testUserId);
    
    if (success) {
      const user = await findUserById(testUserId);
      console.log('✅ Last login updated!');
      console.log('  Last login:', user.last_login);
      console.log('');
      return true;
    } else {
      console.log('❌ Update failed');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Test 12: Update Online Status
const testUpdateOnlineStatus = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 12: Update Online Status');
  console.log('─────────────────────────────────────────────');
  
  try {
    console.log('Setting user online status to TRUE');
    
    let success = await updateOnlineStatus(testUserId, true);
    
    if (success) {
      let user = await findUserById(testUserId);
      console.log('✅ Online status set to:', user.is_online);
      
      // Test setting to false
      console.log('Setting user online status to FALSE');
      success = await updateOnlineStatus(testUserId, false);
      user = await findUserById(testUserId);
      console.log('✅ Online status set to:', user.is_online);
      console.log('');
      return true;
    } else {
      console.log('❌ Update failed');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('═════════════════════════════════════════════');
  console.log('           USER MODEL TEST SUITE');
  console.log('═════════════════════════════════════════════\n');
  
  const results = [];
  
  // Run tests sequentially
  results.push(await testCreateUser());
  results.push(await testFindUserByEmail());
  results.push(await testFindUserByUsername());
  results.push(await testFindUserById());
  results.push(await testFindUserByVerificationToken());
  results.push(await testUpdateVerificationStatus());
  results.push(await testUpdatePassword());
  
  const resetToken = await testUpdateResetToken();
  if (resetToken) {
    results.push(await testFindUserByResetToken(resetToken));
  } else {
    results.push(false);
  }
  
  results.push(await testClearResetToken());
  results.push(await testUpdateLastLogin());
  results.push(await testUpdateOnlineStatus());
  
  // Summary
  console.log('═════════════════════════════════════════════');
  console.log('                 TEST SUMMARY');
  console.log('═════════════════════════════════════════════');
  
  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${results.length}`);
  console.log('');
  
  if (failed === 0) {
    console.log('🎉 All tests passed! User Model is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
  }
  
  console.log('═════════════════════════════════════════════');
  console.log('');
  
  // Cleanup suggestion
  console.log('💡 Note: Test user was created in database');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Username: ${testUsername}`);
  console.log(`   User ID: ${testUserId}`);
  console.log('   You can delete it manually if needed.');
  console.log('');
  
  process.exit(0);
};

// Run tests
runAllTests();