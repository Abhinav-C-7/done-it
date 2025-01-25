const router = require('express').Router();
const pool = require('../config/db');

// Get all active services
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all services...');
        const services = await pool.query(
            'SELECT * FROM services WHERE is_active = true ORDER BY category, title'
        );
        console.log(`Found ${services.rows.length} services`);
        res.json(services.rows);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get service by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
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

// Create a new service request
router.post('/request', async (req, res) => {
    try {
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
            amount
        } = req.body;
        
        console.log('Received request body:', req.body);
        
        // Validate required fields
        if (!customer_id || !service_type || !address || !city || !pincode || !scheduled_date || !time_slot || !payment_method || !amount) {
            console.log('Missing fields validation failed:', {
                customer_id: !!customer_id,
                service_type: !!service_type,
                address: !!address,
                city: !!city,
                pincode: !!pincode,
                scheduled_date: !!scheduled_date,
                time_slot: !!time_slot,
                payment_method: !!payment_method,
                amount: !!amount
            });
            return res.status(400).json({ message: 'Missing required fields' });
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

        // Handle location point
        let locationQuery = 'NULL';
        let locationParams = [];
        
        if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
            locationQuery = 'point($4, $5)';
            locationParams = [longitude, latitude];
        }

        const queryParams = [
            customer_id, 
            service_type, 
            description || '', 
            ...locationParams,
            address,
            landmark || '',
            city,
            pincode,
            scheduled_date,
            time_slot,
            payment_method,
            parseFloat(amount)
        ];

        const placeholders = Array.from({ length: queryParams.length }, (_, i) => `$${i + 1}`);
        
        const query = `
            INSERT INTO service_requests (
                customer_id, 
                service_type, 
                description, 
                location, 
                address,
                landmark,
                city,
                pincode,
                scheduled_date,
                time_slot,
                payment_method,
                amount
            ) VALUES (
                $1, $2, $3, 
                ${locationQuery}, 
                ${placeholders.slice(locationParams.length + 3).join(', ')}
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

module.exports = router;
