const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});
const pool = require('./config/db');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const workerRoutes = require('./routes/workers');

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files (including images)
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/workers', workerRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle location updates from workers
    socket.on('updateLocation', async (data) => {
        try {
            const { workerId, latitude, longitude } = data;
            await pool.query(
                'UPDATE worker_profiles SET current_location = point($1, $2) WHERE worker_id = $3',
                [longitude, latitude, workerId]
            );
            io.emit('workerLocationUpdated', data);
        } catch (err) {
            console.error('Error updating location:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Serving static files from: ${path.join(__dirname, 'public', 'images')}`);
});
