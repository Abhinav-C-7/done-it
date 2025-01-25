const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, phone_number, user_type } = req.body;
        
        // Check if user exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user
        const newUser = await pool.query(
            'INSERT INTO users (email, password, full_name, phone_number, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, hashedPassword, full_name, phone_number, user_type]
        );
        
        // If worker, create worker profile
        if (user_type === 'worker') {
            await pool.query(
                'INSERT INTO worker_profiles (worker_id) VALUES ($1)',
                [newUser.rows[0].user_id]
            );
        }
        
        // Create token
        const token = jwt.sign(
            { id: newUser.rows[0].user_id, user_type },
            process.env.JWT_SECRET || 'your_jwt_secret'
        );
        
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.rows[0].user_id, user_type: user.rows[0].user_type },
            process.env.JWT_SECRET || 'your_jwt_secret'
        );

        // Send user data without password
        const userData = {
            user_id: user.rows[0].user_id,
            email: user.rows[0].email,
            full_name: user.rows[0].full_name,
            phone_number: user.rows[0].phone_number,
            user_type: user.rows[0].user_type
        };

        res.json({ token, user: userData });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify token and get user data
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        const user = await pool.query(
            'SELECT user_id, email, full_name, phone_number, user_type FROM users WHERE user_id = $1',
            [decoded.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: user.rows[0] });
    } catch (err) {
        console.error(err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
