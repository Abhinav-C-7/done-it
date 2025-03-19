const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigration() {
    try {
        console.log('Starting admin table migration...');
        
        // Read the SQL file
        const sqlFilePath = path.join(__dirname, 'create_admin_table.sql');
        const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Execute the SQL query
        await pool.query(sqlQuery);
        
        console.log('Admin table migration completed successfully!');
        console.log('Default admin credentials:');
        console.log('Email: admin@doneit.com');
        console.log('Password: admin123');
        console.log('IMPORTANT: Change the default password after first login for security reasons.');
    } catch (error) {
        console.error('Error running admin table migration:', error);
    } finally {
        // Close the pool
        pool.end();
    }
}

// Run the migration
runMigration();
