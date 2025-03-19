const router = require('express').Router();
const { sendVerificationEmail, verifyCode } = require('../services/emailService');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Request verification code
router.post('/send-code', async (req, res) => {
  try {
    const { email, full_name } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if email already exists in customers table
    const existingUser = await pool.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Send verification email
    await sendVerificationEmail(email, full_name);
    
    res.json({ 
      message: 'Verification code sent successfully',
      email
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify code and register user
router.post('/verify-and-register', async (req, res) => {
  try {
    const { email, verification_code, password, full_name, phone_number } = req.body;
    
    // Validate required fields
    if (!email || !verification_code || !password || !full_name) {
      return res.status(400).json({ 
        message: 'Email, verification code, password, and full name are required' 
      });
    }
    
    // Verify the code
    const verification = await verifyCode(email, verification_code);
    
    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = await pool.query(
      'INSERT INTO customers (email, password, full_name, phone_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, full_name, phone_number]
    );
    
    // Create token
    const token = jwt.sign(
      { 
        id: newUser.rows[0].user_id,
        type: 'customer'
      },
      process.env.JWT_SECRET || 'your_jwt_secret'
    );
    
    res.json({ 
      token,
      user: {
        id: newUser.rows[0].user_id,
        email: newUser.rows[0].email,
        full_name: newUser.rows[0].full_name
      }
    });
  } catch (error) {
    console.error('Error verifying and registering:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend verification code
router.post('/resend-code', async (req, res) => {
  try {
    const { email, full_name } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Send verification email
    await sendVerificationEmail(email, full_name);
    
    res.json({ 
      message: 'Verification code resent successfully',
      email
    });
  } catch (error) {
    console.error('Error resending verification code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
