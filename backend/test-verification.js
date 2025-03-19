// Test script for email verification system
require('dotenv').config();
const { sendVerificationEmail, verifyCode } = require('./services/emailService');

// Test email address - replace with your test email
const testEmail = 'your-test-email@example.com';
const testName = 'Test User';

async function testEmailVerification() {
  try {
    console.log('Starting email verification test...');
    console.log(`Sending verification email to ${testEmail}...`);
    
    // Step 1: Send verification email
    const result = await sendVerificationEmail(testEmail, testName);
    console.log('Verification email sent successfully!');
    console.log('Verification code:', result.code);
    
    // Step 2: Verify the code
    console.log('Testing code verification...');
    const verification = await verifyCode(testEmail, result.code);
    
    if (verification.valid) {
      console.log('Code verification successful!');
    } else {
      console.error('Code verification failed:', verification.message);
    }
    
    // Step 3: Test invalid code
    console.log('Testing invalid code verification...');
    const invalidVerification = await verifyCode(testEmail, '000000');
    
    if (!invalidVerification.valid) {
      console.log('Invalid code test passed!');
    } else {
      console.error('Invalid code test failed!');
    }
    
    console.log('Email verification test completed!');
  } catch (error) {
    console.error('Error during verification test:', error);
  }
}

// Run the test
testEmailVerification();
