const router = require('express').Router();
const pool = require('../config/db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid auth header found');
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        const token = authHeader.split(' ')[1];
        console.log('Token extracted:', token ? 'Token exists' : 'No token');
        
        if (!token) {
            console.log('No token found after split');
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded successfully:', decoded);
            
            // Add user info to request
            req.user = decoded;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            console.error('JWT SECRET:', process.env.JWT_SECRET ? 'Exists' : 'Missing');
            return res.status(401).json({ message: 'Invalid token.', error: jwtError.message });
        }
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Get all services
router.get('/', async (req, res) => {
    try {
        const services = await pool.query(
            'SELECT service_id, title, description, category, base_price, image_url FROM services WHERE is_active = true ORDER BY title'
        );
        res.json(services.rows);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get services by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const services = await pool.query(
            'SELECT * FROM services WHERE category = $1 AND is_active = true',
            [category]
        );
        res.json(services.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search services
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const services = await pool.query(
            `SELECT * FROM services 
             WHERE (title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1)
             AND is_active = true`,
            [`%${query}%`]
        );
        res.json(services.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending payments for a customer
router.get('/pending-payments', verifyToken, async (req, res) => {
    try {
        console.log('Starting pending-payments endpoint');
        console.log('User from token:', req.user);
        
        // Check if user is a customer
        if (req.user.type !== 'customer') {
            console.log('Access denied: User is not a customer, type is', req.user.type);
            return res.status(403).json({ message: 'Access denied. Only customers can view pending payments.' });
        }
        
        console.log('Fetching pending payments for customer ID:', req.user.id);
        
        // Check if customer_id is valid
        if (!req.user.id) {
            console.error('Missing customer ID in token');
            return res.status(400).json({ message: 'Invalid customer ID: Missing ID' });
        }
        
        const customerId = parseInt(req.user.id);
        if (isNaN(customerId)) {
            console.error('Invalid customer ID (not a number):', req.user.id);
            return res.status(400).json({ message: 'Invalid customer ID: Not a number' });
        }
        
        console.log('Parsed customer ID:', customerId);
        
        // Check if pool is available
        if (!pool) {
            console.error('Database pool is not available');
            return res.status(500).json({ message: 'Database connection error' });
        }
        
        try {
            console.log('Executing database query...');
            
            // First check if the table exists
            const tableCheck = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    AND table_name = 'payment_requests'
                );
            `);
            
            const tableExists = tableCheck.rows[0].exists;
            console.log('payment_requests table exists:', tableExists);
            
            if (!tableExists) {
                console.log('payment_requests table does not exist, returning empty array');
                return res.json({ pendingPayments: [] });
            }
            
            // Get pending payments
            const pendingPayments = await pool.query(
                `SELECT pr.id, pr.request_id, pr.amount, pr.service_type, pr.created_at, 
                pr.status, COALESCE(s.full_name, 'Assigned Serviceman') as serviceman_name
                FROM payment_requests pr
                LEFT JOIN serviceman_profiles s ON pr.serviceman_id = s.serviceman_id
                WHERE pr.customer_id = $1 AND pr.status = 'pending'
                ORDER BY pr.created_at DESC`,
                [customerId]
            );
            
            console.log('Query executed successfully');
            console.log('Pending payments for customer', customerId, ':', pendingPayments.rows);
            
            return res.json({ pendingPayments: pendingPayments.rows });
        } catch (queryErr) {
            console.error('Database query error:', queryErr);
            console.error('Query error stack:', queryErr.stack);
            
            // Check if the error is related to the table not existing
            if (queryErr.message && queryErr.message.includes('relation "payment_requests" does not exist')) {
                console.log('Payment requests table does not exist, returning empty array');
                return res.json({ pendingPayments: [] });
            }
            
            throw queryErr; // Re-throw to be caught by the outer catch
        }
    } catch (err) {
        console.error('Error fetching pending payments:', err);
        console.error('Error stack:', err.stack);
        return res.status(500).json({ 
            message: 'Server error', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Get payment history
router.get('/payment-history', verifyToken, async (req, res) => {
    try {
        // Check if user is a customer
        if (req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        console.log('Fetching payment history for customer ID:', req.user.id);
        
        // Get payment history
        try {
            // Check if payments table exists
            const tableCheck = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    AND table_name = 'payments'
                );
            `);
            
            const tableExists = tableCheck.rows[0].exists;
            console.log('payments table exists:', tableExists);
            
            if (!tableExists) {
                console.log('Payments table does not exist, returning empty array');
                return res.json({ payments: [] });
            }
            
            const payments = await pool.query(
                `SELECT id, payment_id, amount, 
                COALESCE(payment_type, 'service_payment') as payment_type, 
                COALESCE(service_type, 'Service') as service_type, 
                created_at as date, 
                COALESCE(status, 'completed') as status
                FROM payments
                WHERE customer_id = $1
                ORDER BY created_at DESC`,
                [req.user.id]
            );
            
            console.log('Payment history for customer', req.user.id, ':', payments.rows);
            
            res.json({ payments: payments.rows });
        } catch (queryErr) {
            console.error('Database query error:', queryErr);
            
            if (queryErr.message.includes('relation "payments" does not exist')) {
                console.log('Payments table does not exist, returning empty array');
                return res.json({ payments: [] });
            }
            
            throw queryErr;
        }
    } catch (err) {
        console.error('Error fetching payment history:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get service by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if the ID is a number to avoid conflicts with other routes
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ message: 'Invalid service ID format' });
        }
        
        const service = await pool.query(
            'SELECT * FROM services WHERE service_id = $1',
            [id]
        );
        
        if (service.rows.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        res.json(service.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new service request
router.post('/request', async (req, res) => {
    try {
        console.log('Received service request with body:', JSON.stringify(req.body, null, 2));
        
        const { 
            customer_id,
            service_type,
            description,
            latitude,
            longitude,
            address,
            landmark,
            city,
            pincode,
            scheduled_date,
            time_slot,
            payment_method,
            payment_id,
            amount
        } = req.body;
        
        console.log('Parsed request fields:', {
            customer_id,
            service_type,
            address,
            city,
            pincode,
            scheduled_date,
            time_slot,
            payment_method,
            payment_id,
            amount
        });
        
        // Validate required fields
        if (!customer_id || !service_type || !address || !city || !pincode || !scheduled_date || !time_slot || !payment_method || !payment_id || !amount) {
            console.log('Missing fields validation failed:', {
                customer_id: !!customer_id,
                service_type: !!service_type,
                address: !!address,
                city: !!city,
                pincode: !!pincode,
                scheduled_date: !!scheduled_date,
                time_slot: !!time_slot,
                payment_method: !!payment_method,
                payment_id: !!payment_id,
                amount: !!amount
            });
            return res.status(400).json({ 
                message: 'Missing required fields',
                missing: {
                    customer_id: !customer_id,
                    service_type: !service_type,
                    address: !address,
                    city: !city,
                    pincode: !pincode,
                    scheduled_date: !scheduled_date,
                    time_slot: !time_slot,
                    payment_method: !payment_method,
                    payment_id: !payment_id,
                    amount: !amount
                }
            });
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(scheduled_date)) {
            console.log('Invalid date format:', scheduled_date);
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        // Validate pincode format
        const pincodeRegex = /^\d{6}$/;
        if (!pincodeRegex.test(pincode)) {
            console.log('Invalid pincode format:', pincode);
            return res.status(400).json({ message: 'Invalid pincode format' });
        }

        // Prepare base parameters
        const baseParams = [
            customer_id, 
            service_type, 
            description || '', 
            address,
            landmark || '',
            city,
            pincode,
            scheduled_date,
            time_slot,
            payment_method,
            payment_id,
            parseFloat(amount)
        ];

        // Handle location point
        let locationParams = [];
        let locationFields = '';
        let locationValues = '';
        
        if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
            locationFields = ', latitude, longitude';
            locationValues = ', $13, $14';  // Since we have 12 base parameters
            locationParams = [parseFloat(latitude), parseFloat(longitude)];
        }

        // Combine all parameters
        const queryParams = [...baseParams, ...locationParams];

        const query = `
            INSERT INTO service_requests (
                customer_id, 
                service_type, 
                description,
                address,
                landmark,
                city,
                pincode,
                scheduled_date,
                time_slot,
                payment_method,
                payment_id,
                amount${locationFields}
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12${locationValues}
            ) 
            RETURNING *`;
            
        console.log('Executing query:', query);
        console.log('With parameters:', queryParams);

        const newRequest = await pool.query(query, queryParams);
        
        console.log('Request created successfully:', newRequest.rows[0]);
        res.status(201).json(newRequest.rows[0]);
    } catch (err) {
        console.error('Detailed error in service request:', {
            error: err,
            message: err.message,
            stack: err.stack,
            code: err.code,
            detail: err.detail,
            hint: err.hint,
            position: err.position
        });
        res.status(500).json({ message: err.message || 'Server error' });
    }
});

// Create payment order (Demo version)
router.post('/create-payment', async (req, res) => {
    try {
        const { amount } = req.body;
        
        // Ensure amount is a valid number and greater than 0
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
            console.error('Invalid amount received:', amount);
            return res.status(400).json({ message: 'Invalid amount. Amount must be a positive number.' });
        }

        console.log('Creating demo payment order for amount:', parsedAmount);
        
        // Create a dummy order response
        const dummyOrder = {
            id: 'order_demo_' + Date.now(),
            amount: Math.round(parsedAmount * 100),
            currency: 'INR',
            receipt: 'receipt_demo_' + Date.now(),
            status: 'created'
        };

        console.log('Demo payment order created:', dummyOrder);
        res.json(dummyOrder);
    } catch (err) {
        console.error('Error creating demo payment:', err);
        res.status(500).json({ message: 'Error creating payment order: ' + (err.message || 'Unknown error') });
    }
});

// Verify payment (Demo version)
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id } = req.body;
        
        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        // Always return success for demo
        res.json({ 
            status: 'success',
            message: 'Demo payment verified successfully',
            payment_id: razorpay_payment_id || ('pay_demo_' + Date.now())
        });
    } catch (err) {
        console.error('Error verifying demo payment:', err);
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

// Get all service requests (for workers)
router.get('/requests/available', async (req, res) => {
    try {
        const requests = await pool.query(
            'SELECT * FROM service_requests WHERE status = $1 ORDER BY created_at DESC',
            ['pending']
        );
        
        res.json(requests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get service requests by customer
router.get('/requests/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const requests = await pool.query(
            'SELECT * FROM service_requests WHERE customer_id = $1 ORDER BY created_at DESC',
            [customerId]
        );
        
        res.json(requests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update service request status
router.put('/requests/status/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, worker_id } = req.body;
        
        const updatedRequest = await pool.query(
            'UPDATE service_requests SET status = $1, assigned_worker = $2 WHERE request_id = $3 RETURNING *',
            [status, worker_id, requestId]
        );
        
        res.json(updatedRequest.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add review for completed service
router.post('/reviews', async (req, res) => {
    try {
        const { service_request_id, customer_id, worker_id, rating, comment } = req.body;
        
        const newReview = await pool.query(
            'INSERT INTO reviews (service_request_id, customer_id, worker_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [service_request_id, customer_id, worker_id, rating, comment]
        );
        
        // Update worker's average rating
        await pool.query(
            'UPDATE worker_profiles SET rating = (SELECT AVG(rating) FROM reviews WHERE worker_id = $1) WHERE worker_id = $1',
            [worker_id]
        );
        
        res.json(newReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get service request details with location for servicemen
router.get('/request/:requestId/location', async (req, res) => {
    try {
        const { requestId } = req.params;
        
        const request = await pool.query(
            `SELECT 
                sr.request_id,
                sr.service_type,
                sr.description,
                sr.address,
                sr.city,
                sr.pincode,
                sr.scheduled_date,
                sr.time_slot,
                ST_X(sr.location::geometry) as longitude,
                ST_Y(sr.location::geometry) as latitude,
                u.full_name as customer_name,
                u.phone as customer_phone
            FROM service_requests sr
            JOIN users u ON sr.customer_id = u.id
            WHERE sr.request_id = $1 AND sr.assigned_worker = $2`,
            [requestId, req.query.workerId]
        );

        if (request.rows.length === 0) {
            return res.status(404).json({ message: 'Service request not found or not assigned to this worker' });
        }

        res.json(request.rows[0]);
    } catch (err) {
        console.error('Error fetching service request location:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's orders - SEPARATE ROUTE HANDLER
router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        console.log('User in token:', req.user);
        const userId = req.user.id;
        
        // Query to get all orders for the user
        const query = `
            SELECT 
                sr.request_id,
                sr.service_type,
                sr.description as service_description,
                sr.status,
                sr.scheduled_date,
                sr.time_slot,
                sr.address,
                sr.landmark,
                sr.city,
                sr.pincode,
                sr.payment_method,
                sr.payment_id,
                sr.amount,
                sr.created_at
            FROM service_requests sr
            WHERE sr.customer_id = $1
            ORDER BY sr.created_at DESC
        `;
        
        console.log('Executing query with user ID:', userId);
        const result = await pool.query(query, [userId]);
        console.log('Query result rows:', result.rows.length);
        
        if (result.rows.length === 0) {
            return res.json([]);
        }
        
        // Group orders by payment_id
        const ordersMap = {};
        
        result.rows.forEach(order => {
            if (!ordersMap[order.payment_id]) {
                ordersMap[order.payment_id] = {
                    payment_id: order.payment_id,
                    payment_method: order.payment_method,
                    scheduled_date: order.scheduled_date,
                    time_slot: order.time_slot,
                    address: order.address,
                    landmark: order.landmark,
                    city: order.city,
                    pincode: order.pincode,
                    created_at: order.created_at,
                    total_amount: 0,
                    services: []
                };
            }
            
            ordersMap[order.payment_id].services.push({
                request_id: order.request_id,
                service_type: order.service_type,
                service_description: order.service_description,
                status: order.status,
                amount: order.amount
            });
            
            ordersMap[order.payment_id].total_amount += parseFloat(order.amount);
        });
        
        // Convert map to array
        const orders = Object.values(ordersMap);
        console.log('Processed orders:', orders.length);
        
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create a payment request for a service
router.post('/create-payment-request', verifyToken, async (req, res) => {
    try {
        const { requestId, amount, serviceType, customerId } = req.body;
        
        console.log('Creating payment request with data:', { requestId, amount, serviceType, customerId });
        
        // Validate input
        if (!requestId || !amount || amount <= 0 || !serviceType || !customerId) {
            return res.status(400).json({ message: 'Invalid payment request data' });
        }
        
        // Check if user is a serviceman or customer
        if (req.user.type !== 'serviceman' && req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Only servicemen and customers can create payment requests' });
        }
        
        // Check if payment_requests table exists, create if not
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payment_requests (
                id SERIAL PRIMARY KEY,
                request_id VARCHAR(255) NOT NULL,
                customer_id INTEGER NOT NULL,
                serviceman_id INTEGER NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                service_type VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP
            )
        `);
        
        // Check if a payment request already exists for this service request
        const existingRequest = await pool.query(
            `SELECT * FROM payment_requests 
            WHERE request_id = $1 AND customer_id = $2 AND serviceman_id = $3 AND status = 'pending'`,
            [requestId, customerId, req.user.id]
        );
        
        if (existingRequest.rows.length > 0) {
            console.log('Payment request already exists, updating amount');
            // Update the existing payment request
            await pool.query(
                `UPDATE payment_requests 
                SET amount = $1, updated_at = NOW() 
                WHERE request_id = $2 AND customer_id = $3 AND serviceman_id = $4 AND status = 'pending'`,
                [amount, requestId, customerId, req.user.id]
            );
            
            return res.status(200).json({
                message: 'Payment request updated successfully',
                paymentRequestId: existingRequest.rows[0].id
            });
        }
        
        // Create payment request record
        const result = await pool.query(
            `INSERT INTO payment_requests 
            (request_id, customer_id, serviceman_id, amount, service_type, status, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
            RETURNING id`,
            [requestId, customerId, req.user.id, amount, serviceType, 'pending']
        );
        
        console.log('Payment request created with ID:', result.rows[0].id);
        
        // Check if notifications table exists
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    user_type VARCHAR(50) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    related_id VARCHAR(255),
                    related_type VARCHAR(50),
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    is_read BOOLEAN DEFAULT FALSE
                )
            `);
            
            // Create notification for the customer
            await pool.query(
                `INSERT INTO notifications 
                (user_id, user_type, title, message, related_id, related_type, created_at, is_read) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), false)`,
                [
                    customerId, 
                    'customer', 
                    'Payment Required', 
                    `Your ${serviceType} service has been completed. Please make a payment of ₹${amount}.`,
                    requestId,
                    'payment_request'
                ]
            );
            
            console.log('Notification created for customer:', customerId);
        } catch (notificationErr) {
            console.error('Error creating notification:', notificationErr);
            // Continue even if notification creation fails
        }
        
        res.status(201).json({
            message: 'Payment request created successfully',
            paymentRequestId: result.rows[0].id
        });
    } catch (err) {
        console.error('Error creating payment request:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update payment request status
router.put('/update-payment-request/:requestId', verifyToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;
        
        // Validate input
        if (!requestId || !status) {
            return res.status(400).json({ message: 'Invalid request data' });
        }
        
        // Update payment request status
        await pool.query(
            `UPDATE payment_requests 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2`,
            [status, requestId]
        );
        
        res.json({ message: 'Payment request updated successfully' });
    } catch (err) {
        console.error('Error updating payment request:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Record a payment
router.post('/record-payment', verifyToken, async (req, res) => {
    try {
        const { paymentId, amount, serviceId, requestId, paymentType, serviceType } = req.body;
        
        // Validate input
        if (!paymentId || !amount || amount <= 0 || !paymentType) {
            return res.status(400).json({ message: 'Invalid payment data' });
        }
        
        // Create payments table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                payment_id VARCHAR(255) NOT NULL,
                customer_id INTEGER NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_type VARCHAR(50) NOT NULL,
                service_type VARCHAR(255),
                service_id VARCHAR(255),
                request_id VARCHAR(255),
                status VARCHAR(50) NOT NULL DEFAULT 'completed',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP
            )
        `);
        
        // Create payment record
        await pool.query(
            `INSERT INTO payments 
            (payment_id, customer_id, amount, payment_type, service_type, created_at, status) 
            VALUES ($1, $2, $3, $4, $5, NOW(), 'completed')`,
            [paymentId, req.user.id, amount, paymentType, serviceType]
        );
        
        // If this is a service payment, update the payment request status
        if (paymentType === 'service_payment' && requestId) {
            await pool.query(
                `UPDATE payment_requests 
                SET status = 'paid', updated_at = NOW() 
                WHERE request_id = $1 AND customer_id = $2`,
                [requestId, req.user.id]
            );
        }
        
        res.status(201).json({
            message: 'Payment recorded successfully',
            paymentId
        });
    } catch (err) {
        console.error('Error recording payment:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
