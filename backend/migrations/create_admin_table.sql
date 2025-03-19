-- Create admin table
CREATE TABLE IF NOT EXISTS admins (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_email ON admins(email);

-- Insert a default admin user (password is 'admin123' hashed with bcrypt)
-- This is the bcrypt hash of 'admin123' that matches the algorithm used in the login process
INSERT INTO admins (username, email, password, full_name, is_super_admin)
VALUES ('admin', 'admin@doneit.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9MQaCWzq/gEsZm.CkKFCXWFoLkRIzAa', 'System Administrator', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Grant permissions
COMMENT ON TABLE admins IS 'Stores administrator accounts for the Done-it application';
