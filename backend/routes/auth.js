const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, phone_number } = req.body;
        
        console.log('Registration attempt with data:', { email, full_name, phone_number });
        
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
            'SELECT * FROM customers WHERE email = $1',
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
            'INSERT INTO customers (email, password, full_name, phone_number) VALUES ($1, $2, $3, $4) RETURNING *',
            [email, hashedPassword, full_name, phone_number]
        );
        
        // Create token
        const token = jwt.sign(
            { id: newUser.rows[0].user_id },
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
            // Check serviceman_profiles table
            const result = await pool.query(
                'SELECT * FROM serviceman_profiles WHERE email = $1',
                [email]
            );
            if (result.rows.length > 0) {
                user = result.rows[0];
            }
        } else {
            // Check customers table
            const result = await pool.query(
                'SELECT * FROM customers WHERE email = $1',
                [email]
            );
            if (result.rows.length > 0) {
                user = result.rows[0];
            }
        }

        if (!user) {
            // If serviceman, check if registration is pending
            if (isServiceman) {
                const pendingReg = await pool.query(
                    'SELECT status FROM serviceman_registrations WHERE email = $1',
                    [email]
                );
                if (pendingReg.rows.length > 0) {
                    return res.status(400).json({ 
                        message: `Your registration is ${pendingReg.rows[0].status}. Please wait for admin approval.`
                    });
                }
            }
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
                id: isServiceman ? user.serviceman_id : user.user_id,
                type: isServiceman ? 'serviceman' : 'customer'
            },
            process.env.JWT_SECRET || 'your_jwt_secret'
        );

        // Send response based on user type
        if (isServiceman) {
            res.json({
                token,
                serviceman: {
                    id: user.serviceman_id,
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
            'SELECT user_id, email, full_name, phone_number FROM customers WHERE user_id = $1',
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
        const { 
            email, 
            password, 
            full_name, 
            phone_number,
            address,
            city,
            pincode,
            skills,
            id_proof_path 
        } = req.body;
        
        // Validation
        if (!email || !password || !full_name || !phone_number || !address || !city || !pincode || !skills || !id_proof_path) {
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

        // Validate pincode format
        const pincodeRegex = /^\d{6}$/;
        if (!pincodeRegex.test(pincode)) {
            return res.status(400).json({ 
                message: 'Invalid pincode format. Must be 6 digits'
            });
        }
        
        // Check if serviceman exists in either registrations or profiles
        const existingRegistration = await pool.query(
            'SELECT email FROM serviceman_registrations WHERE email = $1',
            [email]
        );
        
        const existingProfile = await pool.query(
            'SELECT email FROM serviceman_profiles WHERE email = $1',
            [email]
        );
        
        if (existingRegistration.rows.length > 0 || existingProfile.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create serviceman registration
        const newServiceman = await pool.query(
            `INSERT INTO serviceman_registrations (
                email, 
                password, 
                full_name, 
                phone_number,
                address,
                city,
                pincode,
                skills,
                id_proof_path,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [
                email, 
                hashedPassword, 
                full_name, 
                phone_number,
                address,
                city,
                pincode,
                skills,
                id_proof_path,
                'pending'
            ]
        );
        
        res.status(201).json({ 
            message: 'Registration submitted successfully. Pending admin approval.',
            registration: {
                id: newServiceman.rows[0].registration_id,
                email: newServiceman.rows[0].email,
                full_name: newServiceman.rows[0].full_name,
                status: newServiceman.rows[0].status
            }
        });

    } catch (err) {
        console.error('Serviceman registration error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Serviceman login
router.post('/serviceman/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Serviceman login attempt:', { email });

        // Validate request
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check if serviceman exists
        const serviceman = await pool.query(
            'SELECT * FROM serviceman_registrations WHERE email = $1',
            [email]
        );
        console.log('Found serviceman:', serviceman.rows[0] ? { 
            email: serviceman.rows[0].email,
            status: serviceman.rows[0].status,
            registration_id: serviceman.rows[0].registration_id
        } : 'Not found');

        if (serviceman.rows.length === 0) {
            console.log('No serviceman found with email:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if serviceman is approved
        if (serviceman.rows[0].status !== 'approved') {
            console.log('Serviceman not approved:', {
                email,
                status: serviceman.rows[0].status
            });
            return res.status(403).json({ message: 'Your registration is pending approval' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, serviceman.rows[0].password);
        console.log('Password verification:', { 
            email,
            isValid: validPassword
        });
        
        if (!validPassword) {
            console.log('Invalid password for:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: serviceman.rows[0].registration_id, type: 'serviceman' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove password from response
        const { password: _, ...servicemanData } = serviceman.rows[0];
        console.log('Login successful:', {
            email,
            registration_id: servicemanData.registration_id
        });

        res.json({
            token,
            user: {
                ...servicemanData,
                type: 'serviceman'
            }
        });

    } catch (err) {
        console.error('Error in serviceman login:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
