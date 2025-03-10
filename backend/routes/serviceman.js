const router = require('express').Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        console.log('Auth header in serviceman.js:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded in serviceman.js:', decoded);
        
        // Add user info to request
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error in serviceman.js:', err.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Get serviceman profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const serviceman = await pool.query(
            'SELECT serviceman_id, email, full_name, phone_number, address, city, pincode, skills, rating, total_jobs, completed_jobs, cancelled_jobs, current_status, current_location FROM serviceman_profiles WHERE serviceman_id = $1',
            [req.user.id]
        );

        res.json(serviceman.rows[0]);
    } catch (err) {
        console.error('Error fetching serviceman profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update serviceman location
router.post('/update-location', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        // Update location in the database
        await pool.query(
            'UPDATE serviceman_profiles SET current_location = point($1, $2), last_active_at = NOW() WHERE serviceman_id = $3',
            [longitude, latitude, req.user.id]
        );

        res.json({ message: 'Location updated successfully' });
    } catch (err) {
        console.error('Error updating serviceman location:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all available jobs for servicemen (regardless of distance)
router.get('/available-jobs', verifyToken, async (req, res) => {
    try {
        console.log('Getting available jobs for serviceman');
        console.log('User from token:', req.user);
        
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            console.log('Access denied: User is not a serviceman. User type:', req.user.type);
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const servicemanId = req.user.id;
        console.log('Serviceman ID:', servicemanId);

        // Query to find all pending service requests regardless of distance or skills match
        console.log('Querying for all pending service requests');
        const query = `
            SELECT 
                sr.request_id,
                sr.customer_id,
                c.full_name as customer_name,
                sr.service_type as service_name,
                sr.description,
                sr.address,
                sr.city,
                sr.pincode,
                sr.landmark,
                sr.latitude as location_lat,
                sr.longitude as location_lng,
                sr.amount as price,
                sr.status,
                sr.created_at,
                sr.scheduled_date,
                sr.time_slot,
                NULL as distance
            FROM 
                service_requests sr
            JOIN 
                customers c ON sr.customer_id = c.user_id
            WHERE 
                sr.status = 'pending'
            ORDER BY 
                sr.created_at DESC
        `;
        
        const availableJobs = await pool.query(query);

        console.log('Available jobs found:', availableJobs.rows.length);
        if (availableJobs.rows.length > 0) {
            console.log('First job:', availableJobs.rows[0]);
        } else {
            console.log('No pending service requests found');
        }
        
        res.json(availableJobs.rows);
    } catch (err) {
        console.error('Error fetching available jobs:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Accept a job
router.post('/accept-job/:requestId', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const servicemanId = req.user.id;
        const requestId = req.params.requestId;

        // Check if the request exists and is still pending
        const request = await pool.query(
            'SELECT * FROM service_requests WHERE request_id = $1 AND status = $2',
            [requestId, 'pending']
        );

        if (request.rows.length === 0) {
            return res.status(404).json({ message: 'Service request not found or already assigned' });
        }

        // Begin transaction
        await pool.query('BEGIN');

        try {
            // Update request status to assigned
            await pool.query(
                'UPDATE service_requests SET status = $1, assigned_serviceman = $2, updated_at = NOW() WHERE request_id = $3',
                ['assigned', servicemanId, requestId]
            );

            // Commit transaction
            await pool.query('COMMIT');

            res.json({ message: 'Job accepted successfully' });
        } catch (err) {
            // Rollback transaction in case of error
            await pool.query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error('Error accepting job:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Reject a job
router.post('/reject-job/:requestId', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const { requestId } = req.params;
        
        // We don't need to update the service request, just track the rejection in a new table
        // This could be implemented if needed to track which servicemen rejected which jobs
        
        res.json({ message: 'Job rejected' });
    } catch (err) {
        console.error('Error rejecting job:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
