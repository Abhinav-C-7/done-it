const pool = require('./config/db');

async function checkTables() {
    try {
        console.log('Checking database tables...');
        
        // Check users table structure
        const usersStructure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);
        
        console.log('\nUsers table structure:');
        console.log(usersStructure.rows);
        
        // Check worker_profiles table structure
        const profilesStructure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'worker_profiles'
            ORDER BY ordinal_position;
        `);
        
        console.log('\nWorker profiles table structure:');
        console.log(profilesStructure.rows);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkTables();
