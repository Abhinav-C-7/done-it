const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, phone_number, user_type } = req.body;
        
        console.log('Registration attempt with data:', { email, full_name, phone_number, user_type });
        
        // Validation
        if (!email || !password || !full_name || !phone_number) {
            console.log('Missing required fields:', { 
                hasEmail: !!email, 
                hasPassword: !!password, 
                hasFullName: !!full_name, 
                hasPhone: !!phone_number 
            });
            return res.status(400).json({ 
                message: 'All fields are required',
                missing: {
                    email: !email,
                    password: !password,
                    full_name: !full_name,
                    phone_number: !phone_number
                }
            });
        }
        
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
        const isServiceman = email.endsWith('@serviceman.doneit.com');

        let user;
        if (isServiceman) {
            // Check worker_profiles table
            const result = await pool.query(
                'SELECT * FROM worker_profiles WHERE email = $1',
                [email]
            );
            if (result.rows.length > 0) {
                user = result.rows[0];
            }
        } else {
            // Check users table
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            if (result.rows.length > 0) {
                user = result.rows[0];
            }
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token with user type
        const token = jwt.sign(
            { 
                id: isServiceman ? user.id : user.user_id,
                type: isServiceman ? 'serviceman' : 'customer'
            },
            process.env.JWT_SECRET || 'your_jwt_secret'
        );

        // Send response based on user type
        if (isServiceman) {
            res.json({
                token,
                serviceman: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    type: 'serviceman'
                }
            });
        } else {
            res.json({
                token,
                user: {
                    id: user.user_id,
                    email: user.email,
                    fullName: user.full_name,
                    phone: user.phone_number,
                    type: 'customer'
                }
            });
        }
    } catch (err) {
        console.error('Login error:', err);
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

// Serviceman Register
router.post('/serviceman/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        // Validation
        if (!email || !password || !fullName) {
            return res.status(400).json({ 
                message: 'All fields are required'
            });
        }
        
        // Validate email format
        const emailRegex = /@serviceman\.doneit\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Invalid email format. Must be name@serviceman.doneit.com'
            });
        }
        
        // Check if serviceman exists
        const servicemanExists = await pool.query(
            'SELECT * FROM worker_profiles WHERE email = $1',
            [email]
        );
        
        if (servicemanExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create serviceman profile with default values for optional fields
        const newServiceman = await pool.query(
            `INSERT INTO worker_profiles 
            (email, password, full_name, mobile_number, skills, availability, current_location, rating, total_jobs) 
            VALUES ($1, $2, $3, NULL, NULL, true, NULL, 0.0, 0) 
            RETURNING id, email, full_name`,
            [email, hashedPassword, fullName]
        );
        
        res.json({ 
            success: true,
            message: 'Registration successful',
            serviceman: {
                id: newServiceman.rows[0].id,
                email: newServiceman.rows[0].email,
                fullName: newServiceman.rows[0].full_name
            }
        });
    } catch (err) {
        console.error('Serviceman registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Serviceman Login
router.post('/serviceman/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if serviceman exists
        const serviceman = await pool.query(
            'SELECT * FROM worker_profiles WHERE email = $1',
            [email]
        );

        if (serviceman.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, serviceman.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { 
                id: serviceman.rows[0].id,
                type: 'serviceman'
            },
            process.env.JWT_SECRET || 'your_jwt_secret'
        );

        res.json({
            token,
            serviceman: {
                id: serviceman.rows[0].id,
                email: serviceman.rows[0].email,
                fullName: serviceman.rows[0].full_name
            }
        });
    } catch (err) {
        console.error('Serviceman login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
