const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, phone_number } = req.body;
        
        console.log('Registration attempt with data:', { email, full_name, phone_number });
        
        // Validation
        if (!email || !password || !full_name) {
            console.log('Missing required fields:', { 
                hasEmail: !!email, 
                hasPassword: !!password, 
                hasFullName: !!full_name
            });
            return res.status(400).json({ 
                message: 'Email, password, and full name are required',
                missing: {
                    email: !email,
                    password: !password,
                    full_name: !full_name
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

// Check if email exists
router.post('/check-email-exists', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if email exists in customers table
    const query = 'SELECT user_id FROM customers WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    return res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking email existence:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Remove the deprecated endpoints
router.post('/send-otp', async (req, res) => {
  // This endpoint is no longer needed
  res.status(404).json({ message: 'Endpoint deprecated' });
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
        
        if (existingRegistration.rows.length > 0) {
            return res.status(400).json({ 
                message: 'Registration already exists. Please wait for approval.'
            });
        }
        
        const existingProfile = await pool.query(
            'SELECT email FROM serviceman_profiles WHERE email = $1',
            [email]
        );
        
        if (existingProfile.rows.length > 0) {
            return res.status(400).json({ 
                message: 'Serviceman already exists. Please log in.'
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Insert into serviceman_registrations table
        const newRegistration = await pool.query(
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
                current_location,
                status,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *`,
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
                current_location,
                'pending'
            ]
        );
        
        res.status(201).json({ 
            message: 'Registration successful. Please wait for admin approval.',
            registration: {
                id: newRegistration.rows[0].registration_id,
                email: newRegistration.rows[0].email,
                fullName: newRegistration.rows[0].full_name,
                status: newRegistration.rows[0].status
            }
        });
    } catch (err) {
        console.error('Serviceman registration error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Serviceman Login
router.post('/serviceman/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Serviceman login attempt:', { email });
        
        // Check if serviceman exists
        const serviceman = await pool.query(
            'SELECT * FROM serviceman_profiles WHERE email = $1',
            [email]
        );
        
        if (serviceman.rows.length === 0) {
            // Check if registration is pending
            const pendingReg = await pool.query(
                'SELECT status FROM serviceman_registrations WHERE email = $1',
                [email]
            );
            
            if (pendingReg.rows.length > 0) {
                return res.status(400).json({ 
                    message: `Your registration is ${pendingReg.rows[0].status}. Please wait for admin approval.`
                });
            }
            
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
                id: serviceman.rows[0].serviceman_id,
                type: 'serviceman'
            },
            process.env.JWT_SECRET || 'your_jwt_secret'
        );
        
        // Remove password from response
        const { password: _, ...servicemanData } = serviceman.rows[0];
        
        res.json({
            token,
            serviceman: {
                ...servicemanData,
                type: 'serviceman'
            }
        });
    } catch (err) {
        console.error('Serviceman login error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        console.log('GET /auth/me endpoint hit');
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No token provided or invalid format');
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        console.log('Token received:', token ? 'Yes' : 'No');
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
            console.log('Decoded token:', decoded);
            
            let user;
            
            // Get user based on type
            if (decoded.type === 'customer') {
                const result = await pool.query(
                    'SELECT * FROM customers WHERE user_id = $1',
                    [decoded.id]
                );
                
                if (result.rows.length === 0) {
                    console.log('Customer not found with ID:', decoded.id);
                    return res.status(404).json({ message: 'User not found' });
                }
                
                // Remove password from response
                const { password, ...userData } = result.rows[0];
                user = { ...userData, type: 'customer' };
            } else if (decoded.type === 'serviceman') {
                const result = await pool.query(
                    'SELECT * FROM serviceman_profiles WHERE serviceman_id = $1',
                    [decoded.id]
                );
                
                if (result.rows.length === 0) {
                    console.log('Serviceman not found with ID:', decoded.id);
                    // For serviceman, we'll still return basic info from token
                    return res.json({
                        user: {
                            id: decoded.id,
                            type: 'serviceman'
                        }
                    });
                }
                
                // Remove password from response
                const { password, ...userData } = result.rows[0];
                user = { ...userData, type: 'serviceman' };
            } else if (decoded.type === 'admin') {
                const result = await pool.query(
                    'SELECT * FROM admins WHERE admin_id = $1',
                    [decoded.id]
                );
                
                if (result.rows.length === 0) {
                    console.log('Admin not found with ID:', decoded.id);
                    return res.status(404).json({ message: 'User not found' });
                }
                
                // Remove password from response
                const { password, ...userData } = result.rows[0];
                user = { ...userData, type: 'admin' };
            } else {
                console.log('Invalid user type in token:', decoded.type);
                return res.status(400).json({ message: 'Invalid user type' });
            }
            
            console.log('User found:', user.email);
            res.json({ user });
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (err) {
        console.error('Error in /auth/me endpoint:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update profile
router.put('/update-profile', async (req, res) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        // Get user type and id from token
        const { id, type } = decoded;
        
        // Update profile based on user type
        if (type === 'customer') {
            const { full_name, phone_number, profile_picture } = req.body;
            
            // Update customer profile
            const result = await pool.query(
                'UPDATE customers SET full_name = COALESCE($1, full_name), phone_number = COALESCE($2, phone_number), profile_picture = COALESCE($3, profile_picture) WHERE user_id = $4 RETURNING *',
                [full_name, phone_number, profile_picture, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Remove password from response
            const { password, ...userData } = result.rows[0];
            
            return res.json({
                message: 'Profile updated successfully',
                user: {
                    ...userData,
                    type: 'customer'
                }
            });
        } else if (type === 'serviceman') {
            const { 
                full_name, 
                phone_number, 
                address, 
                city, 
                pincode,
                skills,
                profile_picture
            } = req.body;
            
            // Update serviceman profile
            const result = await pool.query(
                `UPDATE serviceman_profiles 
                SET 
                    full_name = COALESCE($1, full_name), 
                    phone_number = COALESCE($2, phone_number),
                    address = COALESCE($3, address),
                    city = COALESCE($4, city),
                    pincode = COALESCE($5, pincode),
                    skills = COALESCE($6, skills),
                    profile_picture = COALESCE($7, profile_picture)
                WHERE serviceman_id = $8 
                RETURNING *`,
                [full_name, phone_number, address, city, pincode, skills, profile_picture, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Serviceman not found' });
            }
            
            // Remove password from response
            const { password, ...servicemanData } = result.rows[0];
            
            return res.json({
                message: 'Profile updated successfully',
                user: {
                    ...servicemanData,
                    type: 'serviceman'
                }
            });
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }
    } catch (err) {
        console.error('Profile update error:', err.message);
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
