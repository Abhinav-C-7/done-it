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
        console.log('Login attempt:', { email, isPassword: !!password });
        
        const isServiceman = email.endsWith('@serviceman.doneit.com');
        const isAdmin = email.endsWith('@admin.doneit.com') || email === 'admin@doneit.com';
        
        console.log('User type detection:', { isServiceman, isAdmin });

        let user;
        if (isAdmin) {
            // Check admins table
            console.log('Checking admin table for:', email);
            const result = await pool.query(
                'SELECT * FROM admins WHERE email = $1',
                [email]
            );
            console.log('Admin query result:', { found: result.rows.length > 0 });
            if (result.rows.length > 0) {
                user = result.rows[0];
                console.log('Admin found:', { adminId: user.admin_id, email: user.email });
            }
        } else if (isServiceman) {
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
            console.log('User not found for email:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        console.log('Validating password for user:', { email: user.email });
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password validation result:', validPassword);
        
        if (!validPassword) {
            console.log('Invalid password for user:', { email: user.email });
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token with user type
        const token = jwt.sign(
            { 
                id: isAdmin ? user.admin_id : (isServiceman ? user.serviceman_id : user.user_id),
                type: isAdmin ? 'admin' : (isServiceman ? 'serviceman' : 'customer')
            },
            process.env.JWT_SECRET || 'your_jwt_secret'
        );

        // Send response based on user type
        if (isAdmin) {
            res.json({
                token,
                user: {
                    id: user.admin_id,
                    email: user.email,
                    fullName: user.full_name,
                    phone: user.phone_number,
                    role: user.role,
                    type: 'admin'
                }
            });
        } else if (isServiceman) {
            res.json({
                token,
                user: {
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
        console.log('Decoded token in /auth/verify:', decoded);
        
        // Check user type and get profile
        if (decoded.type === 'admin') {
            console.log('User is an admin');
            // Get admin profile
            const admin = await pool.query(
                'SELECT * FROM admins WHERE admin_id = $1',
                [decoded.id]
            );
            
            if (admin.rows.length === 0) {
                return res.status(404).json({ message: 'Admin profile not found' });
            }
            
            // Remove password from response
            const { password, ...adminData } = admin.rows[0];
            
            return res.json({
                user: {
                    ...adminData,
                    type: 'admin'
                }
            });
        } else if (decoded.type === 'serviceman') {
            console.log('User is a serviceman');
            // Get serviceman profile
            const serviceman = await pool.query(
                'SELECT * FROM serviceman_profiles WHERE serviceman_id = $1',
                [decoded.id]
            );
            
            console.log('Serviceman query result:', serviceman.rows.length > 0 ? 'Found' : 'Not found');
            
            // Even if profile is not found, return basic info from token
            if (serviceman.rows.length === 0) {
                console.log('Returning basic serviceman info from token');
                return res.json({
                    user: {
                        serviceman_id: decoded.id,
                        type: 'serviceman'
                    }
                });
            }
            
            // Remove password from response
            const { password, ...servicemanData } = serviceman.rows[0];
            
            return res.json({
                user: {
                    ...servicemanData,
                    type: 'serviceman'
                }
            });
        } else {
            console.log('User is a customer');
            // Get customer profile
            const customer = await pool.query(
                'SELECT * FROM customers WHERE user_id = $1',
                [decoded.id]
            );
            
            console.log('Customer query result:', customer.rows.length > 0 ? 'Found' : 'Not found');
            
            if (customer.rows.length === 0) {
                return res.status(404).json({ message: 'Customer profile not found' });
            }
            
            // Remove password from response
            const { password, ...customerData } = customer.rows[0];
            
            return res.json({
                user: {
                    ...customerData,
                    type: 'customer'
                }
            });
        }
    } catch (err) {
        console.error('Token verification error:', err.message);
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
            id_proof_path,
            current_location
        } = req.body;
        
        console.log('Received registration data:', req.body);
        console.log('Current location from request:', current_location);
        
        // Validation
        if (!email || !password || !full_name || !phone_number || !address || !city || !pincode || !skills || !id_proof_path || !current_location) {
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
                status,
                current_location
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                $11::point
            ) RETURNING *`,
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
                'pending',
                current_location
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
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
        console.error('Request body:', req.body);
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

// Get current user profile (me)
router.get('/me', async (req, res) => {
    try {
        console.log('GET /auth/me endpoint hit');
        // Get token from header
        const authHeader = req.headers.authorization;
        console.log('Auth header in /me:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid auth header found in /me');
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        const token = authHeader.split(' ')[1];
        console.log('Token extracted in /me:', token ? 'Token exists' : 'No token');
        
        if (!token) {
            console.log('No token found after split in /me');
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token in /auth/me:', decoded);
        
        // Check user type and get profile
        if (decoded.type === 'serviceman') {
            console.log('User is a serviceman');
            // Get serviceman profile
            const serviceman = await pool.query(
                'SELECT * FROM serviceman_profiles WHERE serviceman_id = $1',
                [decoded.id]
            );
            
            console.log('Serviceman query result:', serviceman.rows.length > 0 ? 'Found' : 'Not found');
            
            // Even if profile is not found, return basic info from token
            if (serviceman.rows.length === 0) {
                console.log('Returning basic serviceman info from token');
                return res.json({
                    serviceman_id: decoded.id,
                    type: 'serviceman'
                });
            }
            
            // Remove password from response
            const { password, ...servicemanData } = serviceman.rows[0];
            
            return res.json({
                ...servicemanData,
                type: 'serviceman'
            });
        } else {
            console.log('User is a customer');
            // Get customer profile
            const customer = await pool.query(
                'SELECT * FROM customers WHERE user_id = $1',
                [decoded.id]
            );
            
            console.log('Customer query result:', customer.rows.length > 0 ? 'Found' : 'Not found');
            
            if (customer.rows.length === 0) {
                return res.status(404).json({ message: 'Customer profile not found' });
            }
            
            // Remove password from response
            const { password, ...customerData } = customer.rows[0];
            
            return res.json({
                ...customerData,
                type: 'customer'
            });
        }
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Test endpoint for debugging
router.get('/test', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth header in /test:', authHeader);
        
        if (!authHeader) {
            return res.json({ message: 'No authorization header provided' });
        }
        
        if (!authHeader.startsWith('Bearer ')) {
            return res.json({ message: 'Authorization header does not start with Bearer' });
        }
        
        const token = authHeader.split(' ')[1];
        console.log('Token extracted in /test:', token);
        
        if (!token) {
            return res.json({ message: 'No token found after split' });
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token in /test:', decoded);
            return res.json({ 
                message: 'Token valid', 
                decoded,
                env: {
                    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
                }
            });
        } catch (err) {
            console.error('Token verification error in /test:', err.message);
            return res.json({ message: 'Token invalid', error: err.message });
        }
    } catch (err) {
        console.error('Error in test endpoint:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update user profile
router.put('/update-profile', async (req, res) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        // Extract data from request
        const { full_name, phone_number, address, profile_picture } = req.body;
        
        // Update based on user type
        if (decoded.type === 'serviceman') {
            // Update serviceman profile
            const updateQuery = `
                UPDATE serviceman_profiles 
                SET 
                    full_name = COALESCE($1, full_name),
                    phone_number = COALESCE($2, phone_number),
                    address = COALESCE($3, address)
                    ${profile_picture ? ', profile_picture = $4' : ''}
                WHERE serviceman_id = $${profile_picture ? '5' : '4'}
                RETURNING *
            `;
            
            const queryParams = [
                full_name,
                phone_number,
                address
            ];
            
            if (profile_picture) {
                queryParams.push(profile_picture);
            }
            
            queryParams.push(decoded.id);
            
            const result = await pool.query(updateQuery, queryParams);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Serviceman profile not found' });
            }
            
            // Remove password from response
            const { password, ...updatedData } = result.rows[0];
            
            return res.json({
                ...updatedData,
                type: 'serviceman'
            });
        } else {
            // Update customer profile
            const updateQuery = `
                UPDATE customers 
                SET 
                    full_name = COALESCE($1, full_name),
                    phone_number = COALESCE($2, phone_number),
                    address = COALESCE($3, address)
                    ${profile_picture ? ', profile_picture = $4' : ''}
                WHERE user_id = $${profile_picture ? '5' : '4'}
                RETURNING *
            `;
            
            const queryParams = [
                full_name,
                phone_number,
                address
            ];
            
            if (profile_picture) {
                queryParams.push(profile_picture);
            }
            
            queryParams.push(decoded.id);
            
            const result = await pool.query(updateQuery, queryParams);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Customer profile not found' });
            }
            
            // Remove password from response
            const { password, ...updatedData } = result.rows[0];
            
            return res.json({
                ...updatedData,
                type: 'customer'
            });
        }
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
