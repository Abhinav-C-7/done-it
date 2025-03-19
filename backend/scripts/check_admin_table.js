const pool = require('../config/db');

async function checkAdminTable() {
    try {
        console.log('Checking admin table...');
        
        // Check if table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'admins'
            );
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        console.log('Admin table exists:', tableExists);
        
        if (tableExists) {
            // Check table structure
            const tableStructure = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'admins';
            `);
            
            console.log('Admin table structure:');
            tableStructure.rows.forEach(col => {
                console.log(`- ${col.column_name} (${col.data_type})`);
            });
            
            // Check admin records
            const admins = await pool.query('SELECT admin_id, username, email, full_name, role, is_super_admin FROM admins');
            
            console.log('\nAdmin records:');
            if (admins.rows.length === 0) {
                console.log('No admin records found');
            } else {
                admins.rows.forEach(admin => {
                    console.log(admin);
                });
            }
        }
    } catch (err) {
        console.error('Error checking admin table:', err);
    } finally {
        pool.end();
    }
}

checkAdminTable();
