const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/support');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'support-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Create a new support ticket
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    // Check if user is a customer
    if (req.user.type !== 'customer') {
        return res.status(403).json({ message: 'Only customers can create support tickets' });
    }

    try {
        const { subject, description, requestId } = req.body;
        const customerId = req.user.id;
        
        // Validate required fields
        if (!subject || !description) {
            return res.status(400).json({ message: 'Subject and description are required' });
        }

        // If requestId is provided, verify it belongs to the customer
        if (requestId) {
            const requestCheck = await pool.query(
                'SELECT * FROM service_requests WHERE request_id = $1 AND customer_id = $2',
                [requestId, customerId]
            );
            
            if (requestCheck.rows.length === 0) {
                return res.status(403).json({ message: 'Service request not found or does not belong to this customer' });
            }
        }

        // Get the image URL if an image was uploaded
        const imageUrl = req.file ? `/uploads/support/${req.file.filename}` : null;

        // Insert the support ticket
        const result = await pool.query(
            `INSERT INTO support_tickets 
            (customer_id, request_id, subject, description, image_url, status, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, 'open', NOW(), NOW()) 
            RETURNING *`,
            [customerId, requestId || null, subject, description, imageUrl]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({ message: 'Server error while creating support ticket' });
    }
});

// Get all support tickets for the authenticated customer
router.get('/', authenticateToken, async (req, res) => {
    // Check if user is a customer
    if (req.user.type !== 'customer') {
        return res.status(403).json({ message: 'Only customers can view their support tickets' });
    }

    try {
        const customerId = req.user.id;
        
        const result = await pool.query(
            `SELECT t.*, s.service_type, s.address 
             FROM support_tickets t
             LEFT JOIN service_requests s ON t.request_id = s.request_id
             WHERE t.customer_id = $1
             ORDER BY t.created_at DESC`,
            [customerId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        res.status(500).json({ message: 'Server error while fetching support tickets' });
    }
});

// Get a specific support ticket
router.get('/:ticketId', authenticateToken, async (req, res) => {
    try {
        const { ticketId } = req.params;
        const customerId = req.user.id;
        
        const result = await pool.query(
            `SELECT t.*, s.service_type, s.address 
             FROM support_tickets t
             LEFT JOIN service_requests s ON t.request_id = s.request_id
             WHERE t.ticket_id = $1 AND t.customer_id = $2`,
            [ticketId, customerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Support ticket not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching support ticket:', error);
        res.status(500).json({ message: 'Server error while fetching support ticket' });
    }
});

// Update a support ticket (e.g., add additional information)
router.put('/:ticketId', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { ticketId } = req.params;
        const customerId = req.user.id;
        const { description } = req.body;
        
        // Check if the ticket exists and belongs to the customer
        const ticketCheck = await pool.query(
            'SELECT * FROM support_tickets WHERE ticket_id = $1 AND customer_id = $2',
            [ticketId, customerId]
        );
        
        if (ticketCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Support ticket not found or does not belong to this customer' });
        }
        
        // Only allow updates if the ticket is still open
        if (ticketCheck.rows[0].status !== 'open') {
            return res.status(400).json({ message: 'Cannot update a closed or resolved ticket' });
        }

        // Get the image URL if an image was uploaded
        let imageUrl = ticketCheck.rows[0].image_url;
        if (req.file) {
            imageUrl = `/uploads/support/${req.file.filename}`;
        }

        // Update the ticket
        const result = await pool.query(
            `UPDATE support_tickets 
             SET description = $1, image_url = $2, updated_at = NOW()
             WHERE ticket_id = $3 AND customer_id = $4
             RETURNING *`,
            [description || ticketCheck.rows[0].description, imageUrl, ticketId, customerId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating support ticket:', error);
        res.status(500).json({ message: 'Server error while updating support ticket' });
    }
});

module.exports = router;
