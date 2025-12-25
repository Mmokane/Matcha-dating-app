// ============================================
// PROFILE MODEL TEST
// Comprehensive tests for profile operations
// ============================================

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const profileModel = require('../models/profileModel');
const userModel = require('../models/userModel');
const db = require('../config/db');
const { hashPassword } = require('../utils/passwordUtils');

// Test utilities
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, error = null) {
  testResults.tests.push({ name, passed, error });
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
    if (error) console.log(`   Error: ${error.message}`);
  }
}

// Test data
let testUserId;
let testProfileId;
let testPhotoIds = [];

// ============================================
// RUN ALL TESTS
// ============================================

async function runTests() {
  console.log('\n🧪 STARTING PROFILE MODEL TESTS\n');
  console.log('=' .repeat(50));

  try {
    // Setup: Create test user
    await setupTestUser();

    // Test 1: Create Profile
    await testCreateProfile();

    // Test 2: Get Profile by User ID
    await testGetProfileByUserId();

    // Test 3: Update Profile
    await testUpdateProfile();

    // Test 4: Update Fame Rating
    await testUpdateFameRating();

    // Test 5: Add Photo
    await testAddPhoto();

    // Test 6: Get User Photos
    await testGetUserPhotos();

    // Test 7: Get Profile Picture
    await testGetProfilePicture();

    // Test 8: Count User Photos
    await testCountUserPhotos();

    // Test 9: Set Profile Picture
    await testSetProfilePicture();

    // Test 10: Delete Photo
    await testDeletePhoto();

    // Test 11: Get Complete Profile
    await testGetCompleteProfile();

    // Test 12: Photo Limit (5 photos max)
    await testPhotoLimit();

    // Cleanup
    await cleanup();

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  } finally {
    // Print summary
    printSummary();
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

// ============================================
// SETUP & CLEANUP
// ============================================

async function setupTestUser() {
  try {
    const timestamp = Date.now();
    const password_hash = await hashPassword('TestPassword123!');
    const userData = {
      email: `profile_test_${timestamp}@example.com`,
      username: `profile_test_${timestamp}`,
      password_hash: password_hash,
      first_name: 'Profile',
      last_name: 'Test'
    };

    const user = await userModel.createUser(userData);
    testUserId = user.id;

    // Mark as verified
    await userModel.updateVerificationStatus(testUserId);

    console.log(`📝 Test user created (ID: ${testUserId})\n`);
  } catch (error) {
    console.error('Setup failed:', error.message);
    throw error;
  }
}

async function cleanup() {
  try {
    // Delete test user (cascade will delete profile and photos)
    await db.query('DELETE FROM users WHERE id = ?', [testUserId]);
    console.log('\n🧹 Cleanup completed');
  } catch (error) {
    console.error('Cleanup failed:', error.message);
  }
}

// ============================================
// TEST 1: Create Profile
// ============================================

async function testCreateProfile() {
  try {
    const profileData = {
      gender: 'male',
      sexual_preference: 'women',
      biography: 'Test bio for profile model testing',
      latitude: 51.5074,
      longitude: -0.1278
    };

    const result = await profileModel.createProfile(testUserId, profileData);

    if (result && result.id && result.user_id === testUserId) {
      testProfileId = result.id;
      logTest('Create Profile', true);
    } else {
      logTest('Create Profile', false, new Error('Invalid result structure'));
    }
  } catch (error) {
    logTest('Create Profile', false, error);
  }
}

// ============================================
// TEST 2: Get Profile by User ID
// ============================================

async function testGetProfileByUserId() {
  try {
    const profile = await profileModel.getProfileByUserId(testUserId);

    if (
      profile &&
      profile.user_id === testUserId &&
      profile.gender === 'male' &&
      profile.biography === 'Test bio for profile model testing'
    ) {
      logTest('Get Profile by User ID', true);
    } else {
      logTest('Get Profile by User ID', false, new Error('Profile data mismatch'));
    }
  } catch (error) {
    logTest('Get Profile by User ID', false, error);
  }
}

// ============================================
// TEST 3: Update Profile
// ============================================

async function testUpdateProfile() {
  try {
    const updates = {
      biography: 'Updated biography',
      sexual_preference: 'both'
    };

    const result = await profileModel.updateProfile(testUserId, updates);

    if (result === true) {
      // Verify update
      const profile = await profileModel.getProfileByUserId(testUserId);
      if (
        profile.biography === 'Updated biography' &&
        profile.sexual_preference === 'both'
      ) {
        logTest('Update Profile', true);
      } else {
        logTest('Update Profile', false, new Error('Update not reflected'));
      }
    } else {
      logTest('Update Profile', false, new Error('Update returned false'));
    }
  } catch (error) {
    logTest('Update Profile', false, error);
  }
}

// ============================================
// TEST 4: Update Fame Rating
// ============================================

async function testUpdateFameRating() {
  try {
    const newRating = 75;
    const result = await profileModel.updateFameRating(testUserId, newRating);

    if (result === true) {
      // Verify update
      const profile = await profileModel.getProfileByUserId(testUserId);
      if (profile.fame_rating === newRating) {
        logTest('Update Fame Rating', true);
      } else {
        logTest('Update Fame Rating', false, new Error('Rating not updated'));
      }
    } else {
      logTest('Update Fame Rating', false, new Error('Update returned false'));
    }
  } catch (error) {
    logTest('Update Fame Rating', false, error);
  }
}

// ============================================
// TEST 5: Add Photo
// ============================================

async function testAddPhoto() {
  try {
    const filename = `test_photo_${Date.now()}.jpg`;
    const result = await profileModel.addPhoto(testUserId, filename, true);

    if (
      result &&
      result.id &&
      result.filename === filename &&
      result.is_profile_picture === true
    ) {
      testPhotoIds.push(result.id);
      logTest('Add Photo', true);
    } else {
      logTest('Add Photo', false, new Error('Invalid photo result'));
    }
  } catch (error) {
    logTest('Add Photo', false, error);
  }
}

// ============================================
// TEST 6: Get User Photos
// ============================================

async function testGetUserPhotos() {
  try {
    const photos = await profileModel.getUserPhotos(testUserId);

    if (photos && photos.length === 1 && photos[0].user_id === testUserId) {
      logTest('Get User Photos', true);
    } else {
      logTest('Get User Photos', false, new Error('Photos not retrieved correctly'));
    }
  } catch (error) {
    logTest('Get User Photos', false, error);
  }
}

// ============================================
// TEST 7: Get Profile Picture
// ============================================

async function testGetProfilePicture() {
  try {
    const photo = await profileModel.getProfilePicture(testUserId);

    if (photo && photo.is_profile_picture == 1) {
      logTest('Get Profile Picture', true);
    } else {
      logTest('Get Profile Picture', false, new Error('Profile picture not found'));
    }
  } catch (error) {
    logTest('Get Profile Picture', false, error);
  }
}

// ============================================
// TEST 8: Count User Photos
// ============================================

async function testCountUserPhotos() {
  try {
    const count = await profileModel.countUserPhotos(testUserId);

    if (count === 1) {
      logTest('Count User Photos', true);
    } else {
      logTest('Count User Photos', false, new Error(`Expected 1, got ${count}`));
    }
  } catch (error) {
    logTest('Count User Photos', false, error);
  }
}

// ============================================
// TEST 9: Set Profile Picture
// ============================================

async function testSetProfilePicture() {
  try {
    // Add second photo
    const filename = `test_photo_2_${Date.now()}.jpg`;
    const photo2 = await profileModel.addPhoto(testUserId, filename, false);
    testPhotoIds.push(photo2.id);

    // Set second photo as profile picture
    const result = await profileModel.setProfilePicture(photo2.id, testUserId);

    if (result === true) {
      // Verify
      const profilePic = await profileModel.getProfilePicture(testUserId);
      if (profilePic.id === photo2.id) {
        logTest('Set Profile Picture', true);
      } else {
        logTest('Set Profile Picture', false, new Error('Profile picture not changed'));
      }
    } else {
      logTest('Set Profile Picture', false, new Error('Update returned false'));
    }
  } catch (error) {
    logTest('Set Profile Picture', false, error);
  }
}

// ============================================
// TEST 10: Delete Photo
// ============================================

async function testDeletePhoto() {
  try {
    const photoIdToDelete = testPhotoIds[0];
    const result = await profileModel.deletePhoto(photoIdToDelete, testUserId);

    if (result && result.filename) {
      // Verify deletion
      const photos = await profileModel.getUserPhotos(testUserId);
      if (photos.length === 1 && !photos.find(p => p.id === photoIdToDelete)) {
        logTest('Delete Photo', true);
      } else {
        logTest('Delete Photo', false, new Error('Photo not deleted'));
      }
    } else {
      logTest('Delete Photo', false, new Error('Delete returned null'));
    }
  } catch (error) {
    logTest('Delete Photo', false, error);
  }
}

// ============================================
// TEST 11: Get Complete Profile
// ============================================

async function testGetCompleteProfile() {
  try {
    const complete = await profileModel.getCompleteProfile(testUserId);

    if (
      complete &&
      complete.id === testUserId &&
      complete.username &&
      complete.profile &&
      Array.isArray(complete.photos) &&
      Array.isArray(complete.tags)
    ) {
      logTest('Get Complete Profile', true);
    } else {
      logTest('Get Complete Profile', false, new Error('Incomplete profile data'));
    }
  } catch (error) {
    logTest('Get Complete Profile', false, error);
  }
}

// ============================================
// TEST 12: Photo Limit (5 photos max)
// ============================================

async function testPhotoLimit() {
  try {
    // Add 3 more photos (we already have 1)
    for (let i = 0; i < 3; i++) {
      const filename = `test_photo_limit_${i}_${Date.now()}.jpg`;
      await profileModel.addPhoto(testUserId, filename, false);
    }

    const count = await profileModel.countUserPhotos(testUserId);

    if (count === 4) {
      logTest('Photo Limit Check (4 photos)', true);
    } else {
      logTest('Photo Limit Check', false, new Error(`Expected 4, got ${count}`));
    }

    // Note: The actual 5-photo limit enforcement will be in the controller
  } catch (error) {
    logTest('Photo Limit Check', false, error);
  }
}

// ============================================
// SUMMARY
// ============================================

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log('='.repeat(50));

  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  - ${t.name}`);
        if (t.error) console.log(`    ${t.error.message}`);
      });
  }

  console.log('');
}

// ============================================
// RUN
// ============================================

runTests();