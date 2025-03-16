const router = require('express').Router();
const pool = require('../config/db');
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
        
        try {
            // Verify token with a fallback secret if env variable is not set
            const jwtSecret = process.env.JWT_SECRET || 'doneit-secret-key';
            console.log('Using JWT secret:', jwtSecret ? 'Secret exists' : 'No secret');
            
            const decoded = jwt.verify(token, jwtSecret);
            console.log('Token decoded successfully:', decoded);
            
            // Add user info to request
            req.user = decoded;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ message: 'Invalid token', error: jwtError.message });
        }
    } catch (err) {
        console.error('Error in verifyToken middleware:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get user's orders
router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        console.log('GET /my-orders endpoint hit');
        
        // Check if user exists in request
        if (!req.user || !req.user.id) {
            console.error('No user ID found in token');
            return res.status(401).json({ message: 'User not authenticated properly' });
        }
        
        const userId = req.user.id;
        console.log('Fetching orders for user ID:', userId);
        
        // First check if the user exists in the customers table
        const userCheck = await pool.query(
            'SELECT user_id FROM customers WHERE user_id = $1',
            [userId]
        );
        
        if (userCheck.rows.length === 0) {
            console.error(`User with ID ${userId} not found in customers table`);
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('User exists in customers table');
        
        // Get all orders for the customer with correct column names from the schema
        const result = await pool.query(`
            SELECT 
                sr.request_id,
                sr.service_type,
                sr.status,
                sr.payment_id,
                sr.assigned_serviceman as serviceman_id,
                sr.customer_id,
                sr.created_at,
                sr.amount,
                sr.address,
                sr.scheduled_date,
                sr.time_slot,
                sr.job_status,
                sp.full_name as serviceman_name,
                sp.phone_number as serviceman_phone
            FROM 
                service_requests sr
            LEFT JOIN 
                serviceman_profiles sp ON sr.assigned_serviceman = sp.serviceman_id
            WHERE 
                sr.customer_id = $1
            ORDER BY 
                sr.created_at DESC
        `, [userId]);
        
        console.log(`Found ${result.rows.length} orders for user ${userId}`);
        
        // Return the orders
        res.json(result.rows);
    } catch (err) {
        console.error('Error in /my-orders endpoint:', err);
        res.status(500).json({ 
            message: 'Failed to fetch orders', 
            error: err.message,
            stack: err.stack 
        });
    }
});

// Get nearby service requests (within 800km radius) for servicemen
router.get('/nearby-requests', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (!req.user.email?.includes('@serviceman.doneit.com')) {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const servicemanId = req.user.id;

        // Get serviceman profile to check location and skills
        const serviceman = await pool.query(
            'SELECT serviceman_id, skills, current_location FROM serviceman_profiles WHERE serviceman_id = $1',
            [servicemanId]
        );

        if (serviceman.rows.length === 0) {
            return res.status(404).json({ message: 'Serviceman profile not found' });
        }

        const servicemanData = serviceman.rows[0];
        
        // If no location is set, return an error
        if (!servicemanData.current_location) {
            return res.status(400).json({ 
                message: 'Location not set. Please update your location first.',
                needsLocationUpdate: true
            });
        }

        // Extract coordinates from the point data type
        const servicemanLng = servicemanData.current_location.x;
        const servicemanLat = servicemanData.current_location.y;

        // Query to find service requests within 800km radius that match serviceman skills
        // and are still in pending status (not assigned to any serviceman)
        const availableJobs = await pool.query(`
            SELECT 
                sr.request_id,
                sr.service_type,
                sr.description,
                sr.address,
                sr.city,
                sr.pincode,
                sr.landmark,
                sr.latitude,
                sr.longitude,
                sr.amount,
                sr.scheduled_date,
                sr.time_slot,
                sr.created_at,
                c.full_name as customer_name,
                c.phone_number as customer_phone,
                -- Calculate distance in kilometers using the Haversine formula
                (6371 * acos(cos(radians($1)) * cos(radians(sr.latitude)) * cos(radians(sr.longitude) - radians($2)) + sin(radians($1)) * sin(radians(sr.latitude)))) AS distance
            FROM 
                service_requests sr
            JOIN 
                customers c ON sr.customer_id = c.user_id
            WHERE 
                sr.status = 'pending'
                AND sr.assigned_serviceman IS NULL
                -- Filter by distance (800km)
                AND (6371 * acos(cos(radians($1)) * cos(radians(sr.latitude)) * cos(radians(sr.longitude) - radians($2)) + sin(radians($1)) * sin(radians(sr.latitude)))) <= 800
            ORDER BY 
                sr.scheduled_date ASC, distance ASC
        `, [servicemanLat, servicemanLng]);

        res.json(availableJobs.rows);
    } catch (err) {
        console.error('Error fetching nearby requests:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Accept a service request
router.post('/accept/:requestId', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (!req.user.email?.includes('@serviceman.doneit.com')) {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const { requestId } = req.params;
        const servicemanId = req.user.id;

        // Start a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if the job is still available
            const jobCheck = await client.query(
                'SELECT status, assigned_serviceman FROM service_requests WHERE request_id = $1',
                [requestId]
            );

            if (jobCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Job not found' });
            }

            if (jobCheck.rows[0].status !== 'pending' || jobCheck.rows[0].assigned_serviceman !== null) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'This job is no longer available' });
            }

            // Assign the job to the serviceman
            await client.query(
                'UPDATE service_requests SET assigned_serviceman = $1, status = $2, updated_at = NOW() WHERE request_id = $3',
                [servicemanId, 'assigned', requestId]
            );

            // Update serviceman's total jobs count
            await client.query(
                'UPDATE serviceman_profiles SET total_jobs = total_jobs + 1 WHERE serviceman_id = $1',
                [servicemanId]
            );

            await client.query('COMMIT');
            res.json({ message: 'Job accepted successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error accepting job:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Reject a service request
router.post('/reject/:requestId', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (!req.user.email?.includes('@serviceman.doneit.com')) {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const { requestId } = req.params;
        
        // Simply acknowledge the rejection - we don't need to update the database
        // since the job remains available for other servicemen
        res.json({ message: 'Job rejected successfully' });
    } catch (err) {
        console.error('Error rejecting job:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Process payment for an order
router.post('/payment', verifyToken, async (req, res) => {
    try {
        // Check if user is a customer
        if (req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Not a customer.' });
        }

        const { order_id, amount } = req.body;
        const customerId = req.user.id;

        if (!order_id || !amount) {
            return res.status(400).json({ message: 'Order ID and amount are required' });
        }

        // Start a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if the order belongs to this customer
            const orderCheck = await client.query(
                'SELECT * FROM service_requests WHERE payment_id = $1 AND customer_id = $2',
                [order_id, customerId]
            );

            if (orderCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Order not found or does not belong to you' });
            }

            // Update all services in this order to completed and mark as paid
            await client.query(
                'UPDATE service_requests SET status = $1, payment_status = $2, updated_at = NOW() WHERE payment_id = $3 AND customer_id = $4',
                ['completed', 'paid', order_id, customerId]
            );

            // Create a payment record (in a real app, this would integrate with a payment gateway)
            await client.query(
                `INSERT INTO payments 
                (payment_id, customer_id, amount, payment_method, status, created_at) 
                VALUES ($1, $2, $3, $4, $5, NOW())
                ON CONFLICT (payment_id) DO UPDATE 
                SET status = $5, updated_at = NOW()`,
                [order_id, customerId, amount, 'card', 'completed']
            );

            // Create notification for the customer
            await client.query(
                `INSERT INTO notifications 
                (user_id, user_type, title, message, type, reference_id, created_at, read) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
                [
                    customerId, 
                    'customer', 
                    'Payment Successful', 
                    `Your payment of ₹${amount} for order ${order_id.substring(0, 8)}... has been processed successfully.`,
                    'payment',
                    order_id,
                    false
                ]
            );

            await client.query('COMMIT');
            res.json({ message: 'Payment processed successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Transaction error:', err);
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error processing payment:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Withdraw a service request (only if it's still pending)
router.delete('/withdraw/:requestId', verifyToken, async (req, res) => {
    try {
        // Check if user is a customer
        if (req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Not a customer.' });
        }

        const { requestId } = req.params;
        const customerId = req.user.id;

        // Start a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if the request belongs to this customer and is still pending
            const requestCheck = await client.query(
                'SELECT * FROM service_requests WHERE request_id = $1 AND customer_id = $2 AND status = $3',
                [requestId, customerId, 'pending']
            );

            if (requestCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ 
                    message: 'Service request not found, does not belong to you, or has already been accepted by a serviceman' 
                });
            }

            // Update the request status to 'cancelled'
            await client.query(
                'UPDATE service_requests SET status = $1, updated_at = NOW() WHERE request_id = $2',
                ['cancelled', requestId]
            );

            // Create notification for the customer
            await client.query(
                `INSERT INTO notifications 
                (user_id, user_type, title, message, type, reference_id, created_at, read) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
                [
                    customerId, 
                    'customer', 
                    'Service Request Withdrawn', 
                    `Your service request for ${requestCheck.rows[0].service_type} has been successfully withdrawn.`,
                    'withdrawal',
                    requestId,
                    false
                ]
            );

            await client.query('COMMIT');
            res.json({ message: 'Service request withdrawn successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Transaction error:', err);
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error withdrawing service request:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
