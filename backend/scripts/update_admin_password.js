const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function updateAdminPassword() {
    try {
        console.log('Updating admin password...');
        
        // Generate a new bcrypt hash for 'admin123'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        console.log('Generated new password hash');
        
        // Update the admin password
        const result = await pool.query(
            'UPDATE admins SET password = $1 WHERE email = $2 RETURNING admin_id, email',
            [hashedPassword, 'admin@doneit.com']
        );
        
        if (result.rows.length > 0) {
            console.log('Successfully updated password for admin:', result.rows[0]);
            console.log('You can now log in with:');
            console.log('Email: admin@doneit.com');
            console.log('Password: admin123');
        } else {
            console.log('No admin found with email: admin@doneit.com');
            
            // Check if admin exists
            const adminCheck = await pool.query('SELECT COUNT(*) FROM admins');
            console.log(`Total admins in database: ${adminCheck.rows[0].count}`);
            
            if (adminCheck.rows[0].count === '0') {
                // Insert a new admin if none exists
                console.log('Creating new admin user...');
                const newAdmin = await pool.query(
                    'INSERT INTO admins (username, email, password, full_name, is_super_admin) VALUES ($1, $2, $3, $4, $5) RETURNING admin_id, email',
                    ['admin', 'admin@doneit.com', hashedPassword, 'System Administrator', true]
                );
                
                console.log('Created new admin:', newAdmin.rows[0]);
                console.log('You can now log in with:');
                console.log('Email: admin@doneit.com');
                console.log('Password: admin123');
            }
        }
    } catch (err) {
        console.error('Error updating admin password:', err);
    } finally {
        pool.end();
    }
}

updateAdminPassword();
