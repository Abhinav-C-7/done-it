const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function createNotificationsTable() {
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create_notifications_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('Notifications table created successfully');
    
    // Close the pool
    await pool.end();
  } catch (err) {
    console.error('Error creating notifications table:', err);
    process.exit(1);
  }
}

createNotificationsTable();
