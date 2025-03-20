const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Create order
router.post('/create-order', verifyToken, async (req, res) => {
  try {
    const { amount, service_request_id } = req.body;
    
    console.log('Creating Razorpay order:', { amount, service_request_id, userId: req.user.id });
    
    // Verify the service request belongs to the user
    const serviceRequest = await pool.query(
      'SELECT * FROM service_requests WHERE request_id = $1 AND customer_id = $2',
      [service_request_id, req.user.id]
    );
    
    if (serviceRequest.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // amount in paisa
      currency: 'INR',
      receipt: `receipt_${service_request_id}`,
      notes: {
        service_request_id,
        customer_id: req.user.id
      }
    };
    
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);
    
    // Update service request with order ID
    await pool.query(
      'UPDATE service_requests SET payment_id = $1 WHERE request_id = $2',
      [order.id, service_request_id]
    );
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Payment processing error', error: error.message });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      service_request_id 
    } = req.body;
    
    console.log('Verifying payment:', { 
      orderId: razorpay_order_id, 
      paymentId: razorpay_payment_id,
      serviceRequestId: service_request_id
    });
    
    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
    
    if (generated_signature !== razorpay_signature) {
      console.error('Invalid signature:', { 
        expected: generated_signature, 
        received: razorpay_signature 
      });
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    
    // Update service request status
    await pool.query(
      'UPDATE service_requests SET status = $1 WHERE payment_id = $2',
      ['paid', razorpay_order_id]
    );
    
    // Create payment record
    await pool.query(
      'INSERT INTO payment_requests (request_id, customer_id, amount, service_type, status) ' +
      'SELECT request_id, customer_id, amount, service_type, $1 FROM service_requests WHERE payment_id = $2',
      ['completed', razorpay_order_id]
    );
    
    // Send notification to serviceman
    const io = req.app.get('io');
    const serviceRequest = await pool.query(
      'SELECT * FROM service_requests WHERE payment_id = $1',
      [razorpay_order_id]
    );
    
    if (serviceRequest.rows.length > 0 && serviceRequest.rows[0].assigned_serviceman) {
      const roomName = `serviceman_${serviceRequest.rows[0].assigned_serviceman}`;
      io.to(roomName).emit('payment_completed', {
        request_id: serviceRequest.rows[0].request_id,
        amount: serviceRequest.rows[0].amount
      });
    }
    
    console.log('Payment verified successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

module.exports = router;
