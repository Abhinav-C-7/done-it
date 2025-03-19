const nodemailer = require('nodemailer');
const pool = require('../config/db');

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// Generate a random 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save verification code to database
const saveVerificationCode = async (email, code) => {
  try {
    // Set expiration time to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Delete any existing unused codes for this email
    await pool.query(
      'DELETE FROM verification_codes WHERE email = $1 AND used = FALSE',
      [email]
    );
    
    // Insert new verification code
    const result = await pool.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3) RETURNING id',
      [email, code, expiresAt]
    );
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error saving verification code:', error);
    throw error;
  }
};

// Verify code is valid and not expired
const verifyCode = async (email, code) => {
  try {
    const result = await pool.query(
      'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()',
      [email, code]
    );
    
    if (result.rows.length === 0) {
      return { valid: false, message: 'Invalid or expired verification code' };
    }
    
    // Mark code as used
    await pool.query(
      'UPDATE verification_codes SET used = TRUE WHERE id = $1',
      [result.rows[0].id]
    );
    
    return { valid: true };
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};

// Send verification email
const sendVerificationEmail = async (email, fullName) => {
  try {
    const code = generateVerificationCode();
    await saveVerificationCode(email, code);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Done-it Account Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #f59e0b; text-align: center;">Done-it Account Verification</h2>
          <p>Hello ${fullName || 'there'},</p>
          <p>Thank you for registering with Done-it. Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #334155; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>The Done-it Team</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
    console.log('Message ID:', info.messageId);
    
    return { success: true, code };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  verifyCode
};
