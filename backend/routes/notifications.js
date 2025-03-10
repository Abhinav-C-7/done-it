const router = require('express').Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Get all notifications for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.type;

        // Get all notifications for this user
        const notifications = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 AND user_type = $2 ORDER BY created_at DESC',
            [userId, userType]
        );

        res.json(notifications.rows);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Mark a notification as read
router.put('/:notificationId/read', verifyToken, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;
        const userType = req.user.type;

        // Update the notification
        const result = await pool.query(
            'UPDATE notifications SET read = TRUE WHERE notification_id = $1 AND user_id = $2 AND user_type = $3 RETURNING *',
            [notificationId, userId, userType]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found or not authorized' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Mark all notifications as read
router.put('/read-all', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.type;

        // Update all notifications for this user
        await pool.query(
            'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND user_type = $2',
            [userId, userType]
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
