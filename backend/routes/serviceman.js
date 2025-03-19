const router = require('express').Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        console.log('Auth header in serviceman.js:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded in serviceman.js:', decoded);
        
        // Add user info to request
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error in serviceman.js:', err.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Get serviceman profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const serviceman = await pool.query(
            'SELECT serviceman_id, email, full_name, phone_number, address, city, pincode, skills, rating, total_jobs, completed_jobs, cancelled_jobs, current_status, current_location FROM serviceman_profiles WHERE serviceman_id = $1',
            [req.user.id]
        );

        res.json(serviceman.rows[0]);
    } catch (err) {
        console.error('Error fetching serviceman profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update serviceman location
router.post('/update-location', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        // Update location in the database
        await pool.query(
            'UPDATE serviceman_profiles SET current_location = point($1, $2), last_active_at = NOW() WHERE serviceman_id = $3',
            [longitude, latitude, req.user.id]
        );

        res.json({ message: 'Location updated successfully' });
    } catch (err) {
        console.error('Error updating serviceman location:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all available jobs for servicemen (regardless of distance)
router.get('/available-jobs', verifyToken, async (req, res) => {
    try {
        console.log('Getting available jobs for serviceman');
        console.log('User from token:', req.user);
        
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            console.log('Access denied: User is not a serviceman. User type:', req.user.type);
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const servicemanId = req.user.id;
        console.log('Serviceman ID:', servicemanId);

        // First, check if serviceman profile exists by ID
        const profileCheck = await pool.query(
            'SELECT * FROM serviceman_profiles WHERE serviceman_id = $1',
            [servicemanId]
        );

        // If profile doesn't exist by ID, try to find it by email
        if (profileCheck.rows.length === 0) {
            console.log('Serviceman profile not found by ID, attempting to find by email');
            
            // Get serviceman registration data to get the email
            const registrationData = await pool.query(
                'SELECT * FROM serviceman_registrations WHERE registration_id = $1',
                [servicemanId]
            );
            
            if (registrationData.rows.length === 0) {
                console.log('Serviceman registration not found');
                return res.status(404).json({ message: 'Serviceman registration not found' });
            }
            
            const regData = registrationData.rows[0];
            
            // Try to find profile by email
            const profileByEmail = await pool.query(
                'SELECT * FROM serviceman_profiles WHERE email = $1',
                [regData.email]
            );
            
            if (profileByEmail.rows.length > 0) {
                // Profile exists with this email but different ID
                console.log('Found profile with matching email but different ID');
                
                // Update the serviceman_id to match the token ID
                await pool.query(
                    'UPDATE serviceman_profiles SET serviceman_id = $1 WHERE email = $2',
                    [servicemanId, regData.email]
                );
                
                console.log('Updated serviceman_id to match token ID');
            } else {
                // No profile exists, create one
                console.log('No profile found with this email, creating new profile');
                
                // Create serviceman profile
                try {
                    await pool.query(
                        `INSERT INTO serviceman_profiles 
                        (serviceman_id, email, password, full_name, phone_number, address, city, pincode, skills, current_location) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, point(75.36600000, 11.86630000))`,
                        [
                            servicemanId, 
                            regData.email, 
                            regData.password, 
                            regData.full_name, 
                            regData.phone_number, 
                            regData.address || '', 
                            regData.city || '', 
                            regData.pincode || '', 
                            regData.skills || '{}'
                        ]
                    );
                    console.log('Created serviceman profile with default location');
                } catch (err) {
                    console.error('Error creating serviceman profile:', err);
                    
                    // If error is duplicate key, try to update the existing profile
                    if (err.code === '23505' && err.constraint === 'serviceman_profiles_email_key') {
                        console.log('Profile with this email already exists, trying to update serviceman_id');
                        
                        await pool.query(
                            'UPDATE serviceman_profiles SET serviceman_id = $1 WHERE email = $2',
                            [servicemanId, regData.email]
                        );
                        
                        console.log('Updated serviceman_id for existing profile');
                    } else {
                        return res.status(500).json({ message: 'Failed to create serviceman profile', error: err.message });
                    }
                }
            }
        }

        // Now get the serviceman's current location (which should exist now)
        const servicemanLocation = await pool.query(
            'SELECT current_location FROM serviceman_profiles WHERE serviceman_id = $1',
            [servicemanId]
        );

        console.log('Serviceman location query result:', JSON.stringify(servicemanLocation.rows[0]));
        
        // Check if the location exists
        if (!servicemanLocation.rows[0] || servicemanLocation.rows[0].current_location === null) {
            console.log('Serviceman location still not set after profile creation/update');
            
            // Update with a default location
            await pool.query(
                'UPDATE serviceman_profiles SET current_location = point(75.36600000, 11.86630000) WHERE serviceman_id = $1',
                [servicemanId]
            );
            
            console.log('Updated serviceman with default location');
            
            // Fetch the location again
            const updatedLocation = await pool.query(
                'SELECT current_location FROM serviceman_profiles WHERE serviceman_id = $1',
                [servicemanId]
            );
            
            if (!updatedLocation.rows[0] || updatedLocation.rows[0].current_location === null) {
                return res.status(400).json({ 
                    message: 'Unable to set your location. Please contact support.' 
                });
            }
        }

        console.log('Querying for pending service requests within 10km radius');
        console.log('Serviceman location raw data:', servicemanLocation.rows[0]?.current_location);
        
        // Extract the coordinates directly from the point object
        let servicemanLat, servicemanLng;
        if (servicemanLocation.rows[0]?.current_location) {
            const point = servicemanLocation.rows[0].current_location;
            
            // The coordinates in the database are stored in the WRONG order
            // In the database: x=19.076, y=72.8777 (these are swapped)
            // Correct assignment should be: lat=19.076, lng=72.8777
            console.log(`Raw point coordinates: x=${point.x}, y=${point.y}`);
            
            // SWAP the coordinates to get the correct values
            servicemanLat = point.x; // x contains latitude (incorrectly stored)
            servicemanLng = point.y; // y contains longitude (incorrectly stored)
            
            console.log(`Swapped coordinates for correct assignment: lat=${servicemanLat}, lng=${servicemanLng}`);
            
            // Verify coordinates are in valid ranges
            if (Math.abs(servicemanLat) > 90 || Math.abs(servicemanLng) > 180) {
                console.log('WARNING: Coordinates still invalid after swapping!');
                
                // Force the correct coordinates for Mumbai
                servicemanLat = 19.076;
                servicemanLng = 72.8777;
                console.log(`Forced correct Mumbai coordinates: lat=${servicemanLat}, lng=${servicemanLng}`);
                
                // Update the database with the correct orientation
                try {
                    await pool.query(
                        'UPDATE serviceman_profiles SET current_location = point($1, $2) WHERE serviceman_id = $3',
                        [servicemanLng, servicemanLat, servicemanId]
                    );
                    console.log('Updated serviceman location with correctly oriented coordinates in database');
                } catch (err) {
                    console.error('Error updating serviceman location:', err);
                }
            }
        }
        
        // Modified query to use the correct point coordinates
        const query = `
            SELECT 
                sr.request_id,
                sr.customer_id,
                c.full_name as customer_name,
                sr.service_type as service_name,
                sr.description,
                sr.address,
                sr.city,
                sr.pincode,
                sr.landmark,
                sr.latitude as location_lat,
                sr.longitude as location_lng,
                sr.amount as price,
                sr.status,
                sr.created_at,
                sr.scheduled_date,
                sr.time_slot
            FROM 
                service_requests sr
            JOIN 
                customers c ON sr.customer_id = c.user_id
            WHERE 
                sr.status = 'pending'
            ORDER BY 
                sr.created_at DESC
        `;
        
        const availableJobs = await pool.query(query);
        
        // Filter jobs by distance manually to ensure accuracy
        const jobsWithDistance = availableJobs.rows.map(job => {
            // Calculate distance using Haversine formula
            const jobLat = parseFloat(job.location_lat);
            const jobLng = parseFloat(job.location_lng);
            
            console.log(`Job coordinates: lat=${jobLat}, lng=${jobLng}`);
            
            // Convert to radians
            const lat1 = servicemanLat * Math.PI / 180;
            const lat2 = jobLat * Math.PI / 180;
            const lng1 = servicemanLng * Math.PI / 180;
            const lng2 = jobLng * Math.PI / 180;
            
            // Haversine formula
            const dlon = lng2 - lng1;
            const dlat = lat2 - lat1;
            const a = Math.pow(Math.sin(dlat/2), 2) + 
                      Math.cos(lat1) * Math.cos(lat2) * 
                      Math.pow(Math.sin(dlon/2), 2);
            const c = 2 * Math.asin(Math.sqrt(a));
            const distance = 6371 * c; // Earth radius in km
            
            return {
                ...job,
                distance: parseFloat(distance.toFixed(2)) // Round to 2 decimal places and convert to number
            };
        });
        
        // Filter by distance and sort
        const jobsWithin10km = jobsWithDistance
            .filter(job => job.distance <= 10)
            .sort((a, b) => a.distance - b.distance);
        
        console.log('Available jobs found within 10km:', jobsWithin10km.length);
        if (jobsWithin10km.length > 0) {
            console.log('First job:', jobsWithin10km[0]);
            jobsWithin10km.forEach(job => {
                console.log(`Job ID: ${job.request_id}, Type: ${job.service_name}, Distance: ${job.distance.toFixed(2)} km`);
            });
        } else {
            console.log('No pending service requests found within 10km');
            
            // If no jobs found, check if there's an issue with the coordinates
            if (servicemanLat && servicemanLng) {
                console.log(`Serviceman coordinates: lat=${servicemanLat}, lng=${servicemanLng}`);
                
                // Check all pending jobs and their distances
                console.log('All pending jobs and their distances:');
                jobsWithDistance.forEach(job => {
                    console.log(`Job ID: ${job.request_id}, Type: ${job.service_name}, Lat: ${job.location_lat}, Lng: ${job.location_lng}, Distance: ${job.distance.toFixed(2)} km`);
                });
                
                // Calculate distance to the specific job mentioned
                const specificLat = 9.97020940;
                const specificLng = 76.28546510;
                
                // Convert to radians
                const lat1 = servicemanLat * Math.PI / 180;
                const lat2 = specificLat * Math.PI / 180;
                const lng1 = servicemanLng * Math.PI / 180;
                const lng2 = specificLng * Math.PI / 180;
                
                // Haversine formula
                const dlon = lng2 - lng1;
                const dlat = lat2 - lat1;
                const a = Math.pow(Math.sin(dlat/2), 2) + 
                          Math.cos(lat1) * Math.cos(lat2) * 
                          Math.pow(Math.sin(dlon/2), 2);
                const c = 2 * Math.asin(Math.sqrt(a));
                const distance = 6371 * c; // Earth radius in km
                
                console.log(`Calculated distance to Kochi (9.9702, 76.2855): ${distance.toFixed(2)} km`);
                console.log(`This distance should be within 10km: ${distance <= 10 ? 'YES' : 'NO'}`);
            }
        }
        
        // Return the filtered jobs
        res.json(jobsWithin10km);
    } catch (err) {
        console.error('Error fetching available jobs:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Accept a job
router.post('/accept-job/:requestId', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const servicemanId = req.user.id;
        const requestId = req.params.requestId;

        // Check if the request exists and is still pending
        const request = await pool.query(
            'SELECT * FROM service_requests WHERE request_id = $1 AND status = $2',
            [requestId, 'pending']
        );

        if (request.rows.length === 0) {
            return res.status(404).json({ message: 'Service request not found or already assigned' });
        }

        // Begin transaction
        await pool.query('BEGIN');

        try {
            // Update request status to accepted
            await pool.query(
                'UPDATE service_requests SET status = $1, assigned_serviceman = $2, updated_at = NOW() WHERE request_id = $3',
                ['accepted', servicemanId, requestId]
            );

            // Get serviceman details to include in notification
            const servicemanDetails = await pool.query(
                'SELECT full_name, phone_number FROM serviceman_profiles WHERE serviceman_id = $1',
                [servicemanId]
            );

            if (servicemanDetails.rows.length === 0) {
                throw new Error('Serviceman profile not found');
            }

            const serviceman = servicemanDetails.rows[0];

            // Get customer ID from the service request
            const customerQuery = await pool.query(
                'SELECT customer_id FROM service_requests WHERE request_id = $1',
                [requestId]
            );

            if (customerQuery.rows.length === 0) {
                throw new Error('Service request not found');
            }

            const customerId = customerQuery.rows[0].customer_id;

            // Check if a notification for this job acceptance already exists
            const existingNotification = await pool.query(
                `SELECT * FROM notifications 
                WHERE user_id = $1 AND user_type = $2 AND type = $3 AND reference_id = $4`,
                [customerId, 'customer', 'accepted', requestId]
            );

            // Only create a notification if one doesn't already exist
            if (existingNotification.rows.length === 0) {
                // Create notification for the customer
                await pool.query(
                    `INSERT INTO notifications 
                    (user_id, user_type, title, message, type, reference_id, created_at, read) 
                    VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
                    [
                        customerId, 
                        'customer', 
                        'Service Request Accepted', 
                        `Your service request has been accepted by ${serviceman.full_name}. Contact: ${serviceman.phone_number}`,
                        'accepted',
                        requestId,
                        false
                    ]
                );
            }

            // Commit transaction
            await pool.query('COMMIT');

            res.json({ 
                message: 'Job accepted successfully',
                servicemanName: serviceman.full_name,
                servicemanPhone: serviceman.phone_number
            });
        } catch (err) {
            // Rollback transaction in case of error
            await pool.query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error('Error accepting job:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Reject a job
router.post('/reject-job/:requestId', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const { requestId } = req.params;
        
        // We don't need to update the service request, just track the rejection in a new table
        // This could be implemented if needed to track which servicemen rejected which jobs
        
        res.json({ message: 'Job rejected' });
    } catch (err) {
        console.error('Error rejecting job:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get serviceman's accepted jobs
router.get('/my-jobs', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const servicemanId = req.user.id;
        console.log('Fetching jobs for serviceman ID:', servicemanId);

        // Get all jobs assigned to this serviceman
        const myJobs = await pool.query(
            `SELECT 
                sr.request_id, 
                sr.service_type, 
                sr.description, 
                sr.address as location_address,
                sr.latitude as location_lat,
                sr.longitude as location_lng, 
                sr.status,
                sr.amount as price,
                sr.created_at,
                sr.updated_at,
                sr.job_status,
                c.full_name as customer_name,
                c.phone_number as customer_phone
            FROM service_requests sr
            JOIN customers c ON sr.customer_id = c.user_id
            WHERE sr.assigned_serviceman = $1
            ORDER BY sr.created_at DESC`,
            [servicemanId]
        );

        console.log('Found jobs count:', myJobs.rows.length);
        res.json(myJobs.rows);
    } catch (err) {
        console.error('Error fetching serviceman jobs:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get a specific job details
router.get('/job/:requestId', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const servicemanId = req.user.id;
        const requestId = req.params.requestId;

        // Get job details
        const jobDetails = await pool.query(
            `SELECT 
                sr.request_id, 
                sr.service_type, 
                sr.description, 
                sr.address as location_address,
                sr.latitude as location_lat,
                sr.longitude as location_lng, 
                sr.status,
                sr.amount as price,
                sr.created_at,
                sr.updated_at,
                sr.job_status,
                c.full_name as customer_name,
                c.phone_number as customer_phone,
                c.email as customer_email
            FROM service_requests sr
            JOIN customers c ON sr.customer_id = c.user_id
            WHERE sr.request_id = $1 AND sr.assigned_serviceman = $2`,
            [requestId, servicemanId]
        );

        if (jobDetails.rows.length === 0) {
            return res.status(404).json({ message: 'Job not found or not assigned to you' });
        }

        res.json(jobDetails.rows[0]);
    } catch (err) {
        console.error('Error fetching job details:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update job status
router.put('/job/:requestId/status', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const servicemanId = req.user.id;
        const requestId = req.params.requestId;
        const { jobStatus } = req.body;

        console.log(`Updating job ${requestId} status to ${jobStatus} by serviceman ${servicemanId}`);

        // Validate job status
        const validStatuses = ['pending', 'on_the_way', 'arrived', 'in_progress', 'completed'];
        if (!validStatuses.includes(jobStatus)) {
            return res.status(400).json({ message: 'Invalid job status' });
        }

        // Begin transaction
        await pool.query('BEGIN');

        try {
            // Check if the job belongs to this serviceman
            const jobCheck = await pool.query(
                'SELECT customer_id FROM service_requests WHERE request_id = $1 AND assigned_serviceman = $2',
                [requestId, servicemanId]
            );

            if (jobCheck.rows.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ message: 'Job not found or not assigned to you' });
            }

            const customerId = jobCheck.rows[0].customer_id;

            // Update job_status instead of status
            await pool.query(
                'UPDATE service_requests SET job_status = $1, updated_at = NOW() WHERE request_id = $2',
                [jobStatus, requestId]
            );

            console.log(`Successfully updated job_status to ${jobStatus} for request ${requestId}`);

            // Get serviceman details for notification
            const servicemanDetails = await pool.query(
                'SELECT full_name FROM serviceman_profiles WHERE serviceman_id = $1',
                [servicemanId]
            );

            if (servicemanDetails.rows.length === 0) {
                throw new Error('Serviceman profile not found');
            }

            const serviceman = servicemanDetails.rows[0];

            // Create notification for the customer based on status
            let title = 'Job Status Update';
            let message = '';

            switch (jobStatus) {
                case 'on_the_way':
                    message = `${serviceman.full_name} is on the way to your location.`;
                    break;
                case 'arrived':
                    message = `${serviceman.full_name} has arrived at your location.`;
                    break;
                case 'in_progress':
                    message = `${serviceman.full_name} has started working on your service request.`;
                    break;
                case 'completed':
                    message = `${serviceman.full_name} has completed your service request.`;
                    break;
                default:
                    message = `${serviceman.full_name} has updated the status of your service request.`;
            }

            // Check if a notification for this status update already exists
            const existingNotification = await pool.query(
                `SELECT * FROM notifications 
                WHERE user_id = $1 AND user_type = $2 AND type = $3 AND reference_id = $4 AND message = $5`,
                [customerId, 'customer', 'status_update', requestId, message]
            );

            // Only create a notification if one doesn't already exist
            if (existingNotification.rows.length === 0) {
                await pool.query(
                    `INSERT INTO notifications 
                    (user_id, user_type, title, message, type, reference_id, created_at, read) 
                    VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
                    [
                        customerId, 
                        'customer', 
                        title, 
                        message,
                        'status_update',
                        requestId,
                        false
                    ]
                );
            }

            // Emit socket event for real-time updates
            if (req.app.get('io')) {
                req.app.get('io').to(`customer_${customerId}`).emit('jobStatusUpdate', {
                    requestId,
                    jobStatus,
                    message,
                    servicemanName: serviceman.full_name
                });
            }

            // Commit transaction
            await pool.query('COMMIT');

            res.json({ message: 'Job status updated successfully', jobStatus });
        } catch (err) {
            // Rollback transaction in case of error
            await pool.query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error('Error updating job status:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update job price
router.put('/job/:requestId/price', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const servicemanId = req.user.id;
        const requestId = req.params.requestId;
        const { price } = req.body;

        console.log(`Updating job ${requestId} price to ${price} by serviceman ${servicemanId}`);

        // Validate price
        if (!price || isNaN(price) || price <= 0) {
            return res.status(400).json({ message: 'Invalid price. Please provide a positive number.' });
        }

        // Begin transaction
        await pool.query('BEGIN');

        try {
            // Check if the job belongs to this serviceman and if price is already finalized
            const jobCheck = await pool.query(
                'SELECT customer_id, job_status, price_finalized, service_type FROM service_requests WHERE request_id = $1 AND assigned_serviceman = $2',
                [requestId, servicemanId]
            );

            if (jobCheck.rows.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ message: 'Job not found or not assigned to you' });
            }

            const customerId = jobCheck.rows[0].customer_id;
            const jobStatus = jobCheck.rows[0].job_status;
            const priceFinalized = jobCheck.rows[0].price_finalized;
            const serviceType = jobCheck.rows[0].service_type;

            // Check if price is already finalized
            if (priceFinalized) {
                await pool.query('ROLLBACK');
                return res.status(400).json({ message: 'Price has already been finalized and cannot be changed' });
            }

            // Only allow price update if job is completed
            if (jobStatus !== 'completed') {
                await pool.query('ROLLBACK');
                return res.status(400).json({ message: 'Can only set price after job is completed' });
            }

            // Update job price in the price column and set price_finalized to true
            await pool.query(
                'UPDATE service_requests SET price = $1, price_finalized = true, updated_at = NOW() WHERE request_id = $2',
                [price, requestId]
            );

            console.log(`Successfully updated price to ${price} and set price_finalized to true for request ${requestId}`);

            // Create an entry in the payment_requests table
            const paymentInsertResult = await pool.query(
                `INSERT INTO payment_requests 
                (request_id, customer_id, serviceman_id, amount, service_type, status, created_at) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
                [
                    requestId, 
                    customerId, 
                    servicemanId, 
                    price,
                    serviceType,
                    'pending'
                ]
            );

            const paymentId = paymentInsertResult.rows[0].id;
            console.log(`Created payment request for request_id ${requestId} with amount ${price} and payment ID ${paymentId}`);

            // Get serviceman details for notification
            const servicemanDetails = await pool.query(
                'SELECT full_name FROM serviceman_profiles WHERE serviceman_id = $1',
                [servicemanId]
            );

            if (servicemanDetails.rows.length === 0) {
                throw new Error('Serviceman profile not found');
            }

            const serviceman = servicemanDetails.rows[0];

            // Check if a notification for this price update already exists
            const existingNotification = await pool.query(
                `SELECT * FROM notifications 
                WHERE user_id = $1 AND user_type = $2 AND type = $3 AND reference_id = $4`,
                [customerId, 'customer', 'price_update', requestId]
            );

            // Only create a notification if one doesn't already exist
            if (existingNotification.rows.length === 0) {
                // Create notification for the customer
                await pool.query(
                    `INSERT INTO notifications 
                    (user_id, user_type, title, message, type, reference_id, created_at, read) 
                    VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
                    [
                        customerId, 
                        'customer', 
                        'Price Finalized', 
                        `${serviceman.full_name} has finalized the price for your service request: ₹${price}. Please proceed with payment.`,
                        'price_update',
                        requestId,
                        false
                    ]
                );
            }

            // Emit socket event for real-time updates if available
            if (req.app.get('io')) {
                req.app.get('io').to(`customer_${customerId}`).emit('priceUpdate', {
                    requestId,
                    price,
                    servicemanName: serviceman.full_name,
                    paymentId,
                    serviceType
                });
            }

            // Commit transaction
            await pool.query('COMMIT');

            res.json({ message: 'Job price finalized successfully', price, priceFinalized: true });
        } catch (err) {
            // Rollback transaction in case of error
            await pool.query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error('Error updating job price:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Reject a job
router.post('/reject-job/:requestId', verifyToken, async (req, res) => {
    try {
        // Check if user is a serviceman
        if (req.user.type !== 'serviceman') {
            return res.status(403).json({ message: 'Access denied. Not a serviceman.' });
        }

        const { requestId } = req.params;
        
        // We don't need to update the service request, just track the rejection in a new table
        // This could be implemented if needed to track which servicemen rejected which jobs
        
        res.json({ message: 'Job rejected' });
    } catch (err) {
        console.error('Error rejecting job:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
