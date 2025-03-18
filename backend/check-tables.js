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
        
        // Check service_requests table structure
        const serviceRequestsStructure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'service_requests'
            ORDER BY ordinal_position;
        `);
        
        console.log('\nService Requests table structure:');
        console.table(serviceRequestsStructure.rows);
        
        // Check if price_finalized column exists
        const hasPriceFinalized = serviceRequestsStructure.rows.some(col => col.column_name === 'price_finalized');
        console.log('\nHas price_finalized column:', hasPriceFinalized);
        
        // Check which column name is used for serviceman ID
        const hasServicemanId = serviceRequestsStructure.rows.some(col => col.column_name === 'serviceman_id');
        const hasAssignedServiceman = serviceRequestsStructure.rows.some(col => col.column_name === 'assigned_serviceman');
        console.log('\nHas serviceman_id column:', hasServicemanId);
        console.log('Has assigned_serviceman column:', hasAssignedServiceman);
        
        // Check if updated_at column exists
        const hasUpdatedAt = serviceRequestsStructure.rows.some(col => col.column_name === 'updated_at');
        console.log('\nHas updated_at column:', hasUpdatedAt);
        
        // Check if there's a price column
        const hasPriceColumn = serviceRequestsStructure.rows.some(col => col.column_name === 'price');
        console.log('\nHas price column:', hasPriceColumn);
        
        if (!hasPriceColumn) {
            console.log('\nWARNING: No price column found in service_requests table!');
        }
        
        if (!hasUpdatedAt) {
            console.log('\nWARNING: No updated_at column found in service_requests table!');
        }
        
        // Check for sample data
        const sampleData = await pool.query(`
            SELECT request_id, service_type, price, price_finalized, updated_at
            FROM service_requests
            LIMIT 5;
        `);
        
        console.log('\nSample service_requests data:');
        console.table(sampleData.rows);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkTables();
