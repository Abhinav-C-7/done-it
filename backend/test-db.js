const pool = require('./config/db');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const client = await pool.connect();
        console.log('Successfully connected to the database!');
        
        // Test a simple query
        const result = await client.query('SELECT current_timestamp');
        console.log('Query result:', result.rows[0]);
        
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

testConnection();
