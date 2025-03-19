const router = require('express').Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        // Check if user is admin
        if (decoded.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        // Add admin info to request
        req.admin = { id: decoded.id };
        next();
    } catch (err) {
        console.error('Admin authentication error:', err);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Apply admin authentication middleware to all routes
router.use(authenticateAdmin);

// Get admin dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        // Get counts from various tables
        const customerCount = await pool.query('SELECT COUNT(*) FROM customers');
        const servicemanCount = await pool.query('SELECT COUNT(*) FROM serviceman_profiles');
        const requestCount = await pool.query('SELECT COUNT(*) FROM service_requests');
        const pendingRequestCount = await pool.query("SELECT COUNT(*) FROM service_requests WHERE status = 'pending'");
        
        // Get admin profile
        const admin = await pool.query('SELECT * FROM admins WHERE admin_id = $1', [req.admin.id]);
        
        if (admin.rows.length === 0) {
            return res.status(404).json({ message: 'Admin profile not found' });
        }
        
        // Remove password from response
        const { password, ...adminData } = admin.rows[0];
        
        // Send dashboard data
        res.json({
            admin: adminData,
            stats: {
                customerCount: parseInt(customerCount.rows[0].count),
                servicemanCount: parseInt(servicemanCount.rows[0].count),
                requestCount: parseInt(requestCount.rows[0].count),
                pendingRequestCount: parseInt(pendingRequestCount.rows[0].count)
            }
        });
    } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all customers
router.get('/customers', async (req, res) => {
    try {
        const customers = await pool.query('SELECT user_id, email, full_name, phone_number, created_at FROM customers ORDER BY created_at DESC');
        res.json(customers.rows);
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all servicemen
router.get('/servicemen', async (req, res) => {
    try {
        const servicemen = await pool.query('SELECT serviceman_id, email, full_name, phone_number, skills, created_at FROM serviceman_profiles ORDER BY created_at DESC');
        res.json(servicemen.rows);
    } catch (err) {
        console.error('Error fetching servicemen:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all service requests
router.get('/service-requests', async (req, res) => {
    try {
        const requests = await pool.query(`
            SELECT sr.*, c.full_name as customer_name, sp.full_name as serviceman_name
            FROM service_requests sr
            LEFT JOIN customers c ON sr.customer_id = c.user_id
            LEFT JOIN serviceman_profiles sp ON sr.assigned_serviceman = sp.serviceman_id
            ORDER BY sr.created_at DESC
        `);
        res.json(requests.rows);
    } catch (err) {
        console.error('Error fetching service requests:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
