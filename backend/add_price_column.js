require('dotenv').config();
const pool = require('./config/db');

async function addPriceColumn() {
    try {
        console.log('Checking if price column exists in service_requests table...');
        
        // Check if price column exists
        const columnCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'service_requests' AND column_name = 'price'
            );
        `);
        
        const priceColumnExists = columnCheck.rows[0].exists;
        console.log('Price column exists:', priceColumnExists);
        
        if (!priceColumnExists) {
            console.log('Adding price column to service_requests table...');
            
            // Add price column with default value from amount column
            await pool.query(`
                ALTER TABLE service_requests 
                ADD COLUMN price numeric(10,2) DEFAULT NULL;
            `);
            
            console.log('Price column added successfully.');
            
            // Update price column with values from amount column for existing records
            await pool.query(`
                UPDATE service_requests 
                SET price = amount 
                WHERE price IS NULL;
            `);
            
            console.log('Updated price values from amount column for existing records.');
        } else {
            console.log('Price column already exists. No changes needed.');
        }
        
        console.log('Done. The job price update functionality should now work correctly.');
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

addPriceColumn();
