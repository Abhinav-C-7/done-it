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

module.exports = router;
