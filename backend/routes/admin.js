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
        const result = await pool.query(
            'SELECT user_id, email, full_name, phone_number, created_at FROM customers ORDER BY created_at DESC'
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all servicemen
router.get('/servicemen', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT serviceman_id, email, full_name, skills, created_at FROM serviceman_profiles ORDER BY created_at DESC'
        );
        
        res.json(result.rows);
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

// Get all reviews/feedback
router.get('/reviews', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, 
                c.full_name as customer_name, 
                s.full_name as serviceman_name,
                sr.service_type,
                sr.address
            FROM reviews r
            JOIN customers c ON r.customer_id = c.user_id
            LEFT JOIN serviceman_profiles s ON r.serviceman_id = s.serviceman_id
            JOIN service_requests sr ON r.service_request_id = sr.request_id
            ORDER BY r.created_at DESC
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all serviceman applications
router.get('/applications', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM serviceman_registrations
            ORDER BY created_at DESC
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching serviceman applications:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get ID proof file
router.get('/applications/:id/id-proof', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get the registration details
        const registration = await pool.query(
            'SELECT id_proof_path FROM serviceman_registrations WHERE registration_id = $1',
            [id]
        );
        
        if (registration.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        const idProofPath = registration.rows[0].id_proof_path;
        
        // Check if the file exists
        if (!idProofPath) {
            return res.status(404).json({ message: 'ID proof not found' });
        }
        
        // Send the file
        res.sendFile(idProofPath, { root: process.cwd() });
    } catch (err) {
        console.error('Error fetching ID proof:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve a serviceman application
router.post('/applications/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Begin transaction
        await pool.query('BEGIN');
        
        // Get the registration details
        const registration = await pool.query(
            'SELECT * FROM serviceman_registrations WHERE registration_id = $1',
            [id]
        );
        
        if (registration.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Application not found' });
        }
        
        const applicant = registration.rows[0];
        
        // Create serviceman profile
        const newServiceman = await pool.query(
            `INSERT INTO serviceman_profiles (
                email, password, full_name, phone_number, address, city, pincode, skills,
                rating, total_jobs, completed_jobs, cancelled_jobs, current_status,
                is_active, profile_picture
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [
                applicant.email,
                applicant.password,
                applicant.full_name,
                applicant.phone_number,
                applicant.address,
                applicant.city,
                applicant.pincode,
                applicant.skills,
                0, // rating
                0, // total_jobs
                0, // completed_jobs
                0, // cancelled_jobs
                'offline', // current_status
                true, // is_active
                null // profile_picture
            ]
        );
        
        // Update application status
        await pool.query(
            'UPDATE serviceman_registrations SET status = $1 WHERE registration_id = $2',
            ['approved', id]
        );
        
        // Commit transaction
        await pool.query('COMMIT');
        
        res.json({ 
            message: 'Application approved successfully',
            serviceman: newServiceman.rows[0]
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Error approving application:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject a serviceman application
router.post('/applications/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;
        
        // Update application status
        const result = await pool.query(
            'UPDATE serviceman_registrations SET status = $1, rejection_reason = $2 WHERE registration_id = $3 RETURNING *',
            ['rejected', rejection_reason, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        res.json({ 
            message: 'Application rejected successfully',
            application: result.rows[0]
        });
    } catch (err) {
        console.error('Error rejecting application:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
