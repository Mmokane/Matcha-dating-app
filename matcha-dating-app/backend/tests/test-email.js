// ============================================
// TEST: Email Service
// Run with: node test-email.js
// ============================================

require('dotenv').config({path: '../.env'});
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');

console.log('🧪 Testing Email Service...\n');
console.log('📧 Email Configuration:');
console.log('   HOST:', process.env.EMAIL_HOST);
console.log('   PORT:', process.env.EMAIL_PORT);
console.log('   USER:', process.env.EMAIL_USER);
console.log('   FROM:', process.env.EMAIL_FROM);
console.log('');

// Test 1: Verification Email (preview only, won't actually send with dummy credentials)
const testVerificationEmail = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 1: Verification Email');
  console.log('─────────────────────────────────────────────');
  
  const testData = {
    to: 'testuser@example.com',
    username: 'JohnDoe',
    token: 'a8f5f167f44f4964e6c998dee827110c3f6c77b2a1c8e3f9d4b5a6e7c8d9e0f1'
  };
  
  console.log('📨 Would send verification email to:', testData.to);
  console.log('👤 Username:', testData.username);
  console.log('🔑 Token:', testData.token);
  console.log('🔗 Verification URL:', `${process.env.FRONTEND_URL}/verify-email?token=${testData.token}`);
  console.log('');
  
  try {
    // This will fail with dummy credentials, but shows the attempt
    const result = await sendVerificationEmail(testData.to, testData.username, testData.token);
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', result.messageId);
  } catch (error) {
    console.log('⚠️  Email not sent (expected with dummy credentials)');
    console.log('   Error:', error.message);
    console.log('   This is NORMAL if you have dummy email credentials');
  }
  console.log('');
};

// Test 2: Password Reset Email
const testPasswordResetEmail = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 2: Password Reset Email');
  console.log('─────────────────────────────────────────────');
  
  const testData = {
    to: 'testuser@example.com',
    username: 'JohnDoe',
    token: 'b7c3e2f8a9d1e4b6c8f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9'
  };
  
  console.log('📨 Would send password reset email to:', testData.to);
  console.log('👤 Username:', testData.username);
  console.log('🔑 Token:', testData.token);
  console.log('🔗 Reset URL:', `${process.env.FRONTEND_URL}/reset-password?token=${testData.token}`);
  console.log('');
  
  try {
    const result = await sendPasswordResetEmail(testData.to, testData.username, testData.token);
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', result.messageId);
  } catch (error) {
    console.log('⚠️  Email not sent (expected with dummy credentials)');
    console.log('   Error:', error.message);
    console.log('   This is NORMAL if you have dummy email credentials');
  }
  console.log('');
};

// Test 3: Welcome Email
const testWelcomeEmail = async () => {
  console.log('─────────────────────────────────────────────');
  console.log('Test 3: Welcome Email');
  console.log('─────────────────────────────────────────────');
  
  const testData = {
    to: 'testuser@example.com',
    username: 'JohnDoe'
  };
  
  console.log('📨 Would send welcome email to:', testData.to);
  console.log('👤 Username:', testData.username);
  console.log('');
  
  try {
    const result = await sendWelcomeEmail(testData.to, testData.username);
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', result.messageId);
  } catch (error) {
    console.log('⚠️  Email not sent (expected with dummy credentials)');
    console.log('   Error:', error.message);
    console.log('   This is NORMAL if you have dummy email credentials');
  }
  console.log('');
};

// Run all tests
const runTests = async () => {
  await testVerificationEmail();
  await testPasswordResetEmail();
  await testWelcomeEmail();
  
  console.log('═════════════════════════════════════════════');
  console.log('🎉 Email service tests complete!');
  console.log('═════════════════════════════════════════════');
  console.log('');
  console.log('📝 Note:');
  console.log('   - Emails will FAIL with dummy credentials (this is expected)');
  console.log('   - To send real emails, update .env with real Gmail credentials');
  console.log('   - The test shows what URLs and data would be sent');
  console.log('');
};

runTests();