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

module.exports = router;
