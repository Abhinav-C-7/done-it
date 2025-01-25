const router = require('express').Router();
const pool = require('../config/db');

// Update worker profile
router.put('/profile/:workerId', async (req, res) => {
    try {
        const { workerId } = req.params;
        const { skills, availability } = req.body;
        
        const updatedProfile = await pool.query(
            'UPDATE worker_profiles SET skills = $1, availability = $2 WHERE worker_id = $3 RETURNING *',
            [skills, availability, workerId]
        );
        
        res.json(updatedProfile.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get worker profile
router.get('/profile/:workerId', async (req, res) => {
    try {
        const { workerId } = req.params;
        
        const profile = await pool.query(
            'SELECT wp.*, u.full_name, u.email, u.phone FROM worker_profiles wp JOIN users u ON wp.worker_id = u.id WHERE worker_id = $1',
            [workerId]
        );
        
        if (profile.rows.length === 0) {
            return res.status(404).json({ message: 'Worker profile not found' });
        }
        
        res.json(profile.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get worker's assigned tasks
router.get('/tasks/:workerId', async (req, res) => {
    try {
        const { workerId } = req.params;
        
        const tasks = await pool.query(
            'SELECT * FROM service_requests WHERE assigned_worker = $1 AND status != $2 ORDER BY created_at DESC',
            [workerId, 'completed']
        );
        
        res.json(tasks.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get nearby service requests
router.get('/nearby/:workerId', async (req, res) => {
    try {
        const { workerId } = req.params;
        const { radius } = req.query; // radius in kilometers
        
        const nearbyRequests = await pool.query(
            `SELECT 
                sr.*,
                point(wp.current_location[0], wp.current_location[1]) <-> point(sr.location[0], sr.location[1]) as distance
            FROM service_requests sr
            CROSS JOIN worker_profiles wp
            WHERE wp.worker_id = $1
            AND sr.status = 'pending'
            AND point(wp.current_location[0], wp.current_location[1]) <-> point(sr.location[0], sr.location[1]) <= $2
            ORDER BY distance`,
            [workerId, radius]
        );
        
        res.json(nearbyRequests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get worker's reviews
router.get('/reviews/:workerId', async (req, res) => {
    try {
        const { workerId } = req.params;
        
        const reviews = await pool.query(
            'SELECT r.*, u.full_name as customer_name FROM reviews r JOIN users u ON r.customer_id = u.user_id WHERE r.worker_id = $1 ORDER BY r.created_at DESC',
            [workerId]
        );
        
        res.json(reviews.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all workers with their profiles
router.get('/workers', async (req, res) => {
    try {
        const workers = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.phone, u.profile_pic,
            wp.skills, wp.availability, wp.rating,
            COUNT(DISTINCT sr.id) as total_jobs
            FROM users u
            LEFT JOIN worker_profiles wp ON u.id = wp.worker_id
            LEFT JOIN service_requests sr ON u.id = sr.assigned_worker
            WHERE u.role = 'worker'
            GROUP BY u.id, wp.worker_id, wp.skills, wp.availability, wp.rating`,
        );
        
        res.json(workers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all workers
router.get('/', async (req, res) => {
    try {
        const workers = await pool.query(
            `SELECT 
                u.user_id,
                u.full_name,
                u.email,
                u.phone_number,
                wp.skills,
                wp.availability,
                wp.rating,
                wp.total_jobs,
                wp.current_location
            FROM users u
            JOIN worker_profiles wp ON u.user_id = wp.worker_id
            WHERE u.user_type = 'worker'`
        );
        
        res.json(workers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
