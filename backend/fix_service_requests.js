require('dotenv').config();
const pool = require('./config/db');

async function fixServiceRequestsTable() {
    try {
        console.log('Checking service_requests table structure...');
        
        // Check if the table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'service_requests'
            );
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        console.log('Table service_requests exists:', tableExists);
        
        if (!tableExists) {
            console.error('Error: service_requests table does not exist!');
            return;
        }
        
        // Get current table structure
        const tableStructure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'service_requests'
            ORDER BY ordinal_position;
        `);
        
        console.log('\nCurrent service_requests table structure:');
        console.table(tableStructure.rows);
        
        // Check for required columns
        const columns = tableStructure.rows.map(row => row.column_name);
        console.log('\nColumns found:', columns.join(', '));
        
        // Check and add price column if missing
        if (!columns.includes('price')) {
            console.log('Adding missing price column...');
            await pool.query(`
                ALTER TABLE service_requests 
                ADD COLUMN price NUMERIC DEFAULT 0;
            `);
            console.log('Added price column');
        }
        
        // Check and add price_finalized column if missing
        if (!columns.includes('price_finalized')) {
            console.log('Adding missing price_finalized column...');
            await pool.query(`
                ALTER TABLE service_requests 
                ADD COLUMN price_finalized BOOLEAN DEFAULT FALSE;
            `);
            console.log('Added price_finalized column');
        }
        
        // Check and add updated_at column if missing
        if (!columns.includes('updated_at')) {
            console.log('Adding missing updated_at column...');
            await pool.query(`
                ALTER TABLE service_requests 
                ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
            `);
            console.log('Added updated_at column');
        }
        
        // Check serviceman ID column
        let servicemanColumnName = null;
        if (columns.includes('serviceman_id')) {
            servicemanColumnName = 'serviceman_id';
        } else if (columns.includes('assigned_serviceman')) {
            servicemanColumnName = 'assigned_serviceman';
        } else {
            console.log('Adding missing serviceman_id column...');
            await pool.query(`
                ALTER TABLE service_requests 
                ADD COLUMN serviceman_id VARCHAR(255);
            `);
            servicemanColumnName = 'serviceman_id';
            console.log('Added serviceman_id column');
        }
        
        console.log(`Using ${servicemanColumnName} for serviceman identification`);
        
        // Get updated table structure
        const updatedStructure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'service_requests'
            ORDER BY ordinal_position;
        `);
        
        console.log('\nUpdated service_requests table structure:');
        console.table(updatedStructure.rows);
        
        console.log('\nTable structure has been fixed. The update job price functionality should now work correctly.');
        
    } catch (err) {
        console.error('Error fixing table structure:', err);
    } finally {
        await pool.end();
    }
}

fixServiceRequestsTable();
