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
        const { customer_id, service_type, description, latitude, longitude, address } = req.body;
        
        const newRequest = await pool.query(
            'INSERT INTO service_requests (customer_id, service_type, description, location, address) VALUES ($1, $2, $3, point($4, $5), $6) RETURNING *',
            [customer_id, service_type, description, longitude, latitude, address]
        );
        
        res.json(newRequest.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
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

module.exports = router;
