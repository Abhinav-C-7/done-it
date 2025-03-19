const express = require('express');
const router = express.Router();
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

// Get customer profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        console.log('Fetching customer profile for user:', req.user);
        
        // Ensure user is a customer
        if (req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Only customers can view their profile.' });
        }
        
        // Get customer profile
        const customerProfile = await pool.query(
            'SELECT user_id, email, full_name, phone_number, profile_picture, created_at FROM customers WHERE user_id = $1',
            [req.user.id]
        );
        
        if (customerProfile.rows.length === 0) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }
        
        res.json(customerProfile.rows[0]);
    } catch (err) {
        console.error('Error fetching customer profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get customer saved locations
router.get('/saved-locations', verifyToken, async (req, res) => {
    try {
        console.log('Fetching saved locations for customer:', req.user.id);
        
        // Ensure user is a customer
        if (req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Only customers can view their saved locations.' });
        }
        
        // Check if we have a saved_locations table
        try {
            const savedLocations = await pool.query(
                'SELECT * FROM saved_locations WHERE customer_id = $1 ORDER BY is_default DESC',
                [req.user.id]
            );
            
            res.json(savedLocations.rows);
        } catch (err) {
            // If table doesn't exist, return empty array
            console.log('Saved locations table may not exist:', err.message);
            res.json([]);
        }
    } catch (err) {
        console.error('Error fetching saved locations:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get customer reviews
router.get('/reviews', verifyToken, async (req, res) => {
    try {
        console.log('Fetching reviews for customer:', req.user.id);
        
        // Ensure user is a customer
        if (req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Only customers can view their reviews.' });
        }
        
        // Check if we have a reviews table
        try {
            const reviews = await pool.query(
                `SELECT r.*, s.service_type 
                FROM reviews r
                JOIN service_requests s ON r.request_id = s.request_id
                WHERE r.customer_id = $1
                ORDER BY r.created_at DESC`,
                [req.user.id]
            );
            
            res.json(reviews.rows);
        } catch (err) {
            // If table doesn't exist, return empty array
            console.log('Reviews table may not exist:', err.message);
            res.json([]);
        }
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update customer profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        console.log('Updating customer profile for user:', req.user.id);
        
        // Ensure user is a customer
        if (req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Only customers can update their profile.' });
        }
        
        const { full_name, phone_number, profile_picture } = req.body;
        
        // Build update query based on provided fields
        let updateFields = [];
        let values = [];
        let paramCounter = 1;
        
        if (full_name) {
            updateFields.push(`full_name = $${paramCounter}`);
            values.push(full_name);
            paramCounter++;
        }
        
        if (phone_number) {
            updateFields.push(`phone_number = $${paramCounter}`);
            values.push(phone_number);
            paramCounter++;
        }
        
        if (profile_picture) {
            updateFields.push(`profile_picture = $${paramCounter}`);
            values.push(profile_picture);
            paramCounter++;
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        // Add user ID as the last parameter
        values.push(req.user.id);
        
        const query = `
            UPDATE customers 
            SET ${updateFields.join(', ')}, updated_at = NOW()
            WHERE user_id = $${paramCounter}
            RETURNING user_id, email, full_name, phone_number, profile_picture, created_at
        `;
        
        const updatedProfile = await pool.query(query, values);
        
        if (updatedProfile.rows.length === 0) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }
        
        res.json(updatedProfile.rows[0]);
    } catch (err) {
        console.error('Error updating customer profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending payment requests for customer
router.get('/payment-requests', verifyToken, async (req, res) => {
    try {
        // Ensure user is a customer
        if (req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Not a customer.' });
        }

        const customerId = req.user.id;
        console.log('Fetching payment requests for customer:', customerId);

        // Simple query to get all payment requests for this customer
        const paymentRequests = await pool.query(
            `SELECT * FROM payment_requests WHERE customer_id = $1 ORDER BY created_at DESC`,
            [customerId]
        );

        console.log('Payment requests found:', paymentRequests.rows.length);
        
        res.json(paymentRequests.rows);
    } catch (err) {
        console.error('Error fetching payment requests:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update payment status
router.put('/payment-requests/:id/pay', verifyToken, async (req, res) => {
    try {
        // Ensure user is a customer
        if (req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Not a customer.' });
        }

        const customerId = req.user.id;
        const paymentRequestId = req.params.id;
        const { paymentId } = req.body;

        console.log(`Processing payment for request ${paymentRequestId} by customer ${customerId}`);

        // Begin transaction
        await pool.query('BEGIN');

        try {
            // Check if the payment request belongs to this customer and is pending
            const paymentCheck = await pool.query(
                'SELECT request_id, serviceman_id FROM payment_requests WHERE id = $1 AND customer_id = $2 AND status = $3',
                [paymentRequestId, customerId, 'pending']
            );

            if (paymentCheck.rows.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ message: 'Payment request not found, not owned by you, or already paid' });
            }

            const requestId = paymentCheck.rows[0].request_id;
            const servicemanId = paymentCheck.rows[0].serviceman_id;

            // Update payment request status to paid
            await pool.query(
                'UPDATE payment_requests SET status = $1, updated_at = NOW() WHERE id = $2',
                ['paid', paymentRequestId]
            );

            console.log(`Updated payment request ${paymentRequestId} status to paid`);

            // Get customer details for notification
            const customerDetails = await pool.query(
                'SELECT full_name FROM customers WHERE user_id = $1',
                [customerId]
            );

            if (customerDetails.rows.length === 0) {
                throw new Error('Customer profile not found');
            }

            const customer = customerDetails.rows[0];

            // Create notification for the serviceman
            await pool.query(
                `INSERT INTO notifications 
                (user_id, user_type, title, message, type, reference_id, created_at, read) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
                [
                    servicemanId, 
                    'serviceman', 
                    'Payment Received', 
                    `${customer.full_name} has completed the payment for your service.`,
                    'payment',
                    requestId,
                    false
                ]
            );

            // Commit transaction
            await pool.query('COMMIT');

            res.json({ message: 'Payment completed successfully', status: 'paid' });
        } catch (err) {
            // Rollback transaction in case of error
            await pool.query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error('Error processing payment:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Submit a review
router.post('/reviews', verifyToken, async (req, res) => {
    try {
        // Ensure user is a customer
        if (req.user.type !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Not a customer.' });
        }

        const customerId = req.user.id;
        const { service_request_id, serviceman_id, rating, comment } = req.body;

        console.log(`Customer ${customerId} submitting review for request ${service_request_id}`);
        console.log('Review data received:', req.body);

        // Validate input
        if (!service_request_id || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ 
                message: 'Invalid review data. Service request ID and rating (between 1-5) are required.',
                received: { service_request_id, rating }
            });
        }

        // If serviceman_id is not provided, look it up from the service request
        let finalServicemanId = serviceman_id;
        if (!finalServicemanId) {
            try {
                const serviceRequestResult = await pool.query(
                    'SELECT assigned_serviceman FROM service_requests WHERE request_id = $1',
                    [service_request_id]
                );
                
                if (serviceRequestResult.rows.length === 0) {
                    return res.status(404).json({ message: 'Service request not found' });
                }
                
                finalServicemanId = serviceRequestResult.rows[0].assigned_serviceman;
                
                if (!finalServicemanId) {
                    return res.status(400).json({ 
                        message: 'No serviceman assigned to this service request. Cannot submit review.' 
                    });
                }
                
                console.log(`Retrieved serviceman_id ${finalServicemanId} from service request ${service_request_id}`);
            } catch (err) {
                console.error('Error retrieving serviceman_id:', err);
                return res.status(500).json({ 
                    message: 'Error retrieving serviceman information',
                    error: err.message 
                });
            }
        }

        // Insert review
        await pool.query(
            `INSERT INTO reviews (service_request_id, customer_id, serviceman_id, rating, comment, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [service_request_id, customerId, finalServicemanId, rating, comment || '']
        );

        console.log(`Review submitted successfully for request ${service_request_id}`);
        
        res.json({ message: 'Review submitted successfully. Thank you for choosing Done-it!' });
    } catch (err) {
        console.error('Error submitting review:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
