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
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', decoded);
        
        // Add user info to request
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Get user's orders
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

module.exports = router;
