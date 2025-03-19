// Test script for sending OTP emails
const nodemailer = require('nodemailer');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send test email
async function sendTestEmail() {
  try {
    const email = 'test@example.com'; // Replace with your test email
    const otp = generateOTP();
    const fullName = 'Test User';
    
    console.log('Generated OTP:', otp);
    
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your email
        pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Replace with your app password
      }
    });
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your email
      to: email,
      subject: 'Done-it Account Verification - Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #f59e0b; text-align: center;">Done-it Account Verification</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for registering with Done-it. Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #334155; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>The Done-it Team</p>
        </div>
      `
    };
    
    console.log('Attempting to send email to:', email);
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

// Run the test
sendTestEmail();
