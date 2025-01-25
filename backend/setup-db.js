const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function setupDatabase() {
    try {
        console.log('Starting database setup...');

        // Read schema file
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

        // Force drop and recreate services table
        await pool.query('DROP TABLE IF EXISTS services CASCADE');
        
        // Execute schema
        await pool.query(schemaSQL);
        console.log('Schema executed successfully');

        // Verify users
        const usersResult = await pool.query('SELECT COUNT(*) FROM users');
        console.log(`Current users count: ${usersResult.rows[0].count}`);

        // Verify services
        const servicesResult = await pool.query('SELECT COUNT(*) FROM services');
        console.log(`Current services count: ${servicesResult.rows[0].count}`);

        console.log('Database setup completed successfully');
    } catch (err) {
        console.error('Error setting up database:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

setupDatabase().catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
});
