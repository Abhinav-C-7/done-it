-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    user_type TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create worker_profiles table
CREATE TABLE IF NOT EXISTS worker_profiles (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER NOT NULL REFERENCES users(id),
    skills TEXT[],
    availability BOOLEAN DEFAULT true,
    current_location POINT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    service_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Insert initial services if none exist
INSERT INTO services (title, description, category, base_price, image_url)
SELECT * FROM (VALUES
    ('Home Cleaning Service', 'Professional home cleaning service including dusting, vacuuming, and sanitizing', 'Home Cleaning', 2000.00, '/images/services/cleaning-service.jpg'),
    ('Landscaping Service', 'Complete garden and lawn maintenance service', 'Gardening', 1000.00, '/images/services/landscaping.png'),
    ('Fan Installation', 'Professional ceiling fan installation service', 'Electrical', 500.00, '/images/services/fan.jpg'),
    ('Plumbing Repair', 'Expert plumbing services for leaks, installations, and repairs', 'Plumbing', 800.00, '/images/services/plumbing.png'),
    ('AC Service & Repair', 'Air conditioner maintenance, repair, and installation services', 'Appliance Repair', 1500.00, '/images/services/ac-repair.jpg'),
    ('Painting Service', 'Interior and exterior painting services with quality materials', 'Home Improvement', 3000.00, '/images/services/painting.png'),
    ('Pest Control', 'Comprehensive pest control treatment for all types of pests', 'Home Care', 1200.00, '/images/services/pest-control.png'),
    ('Carpentry Work', 'Custom carpentry services for furniture repair and installation', 'Carpentry', 1000.00, '/images/services/carpentry.png'),
    ('Electrical Repair', 'Professional electrical repair and installation services', 'Electrical', 700.00, '/images/services/electrical.png'),
    ('Appliance Repair', 'Repair services for washing machines, refrigerators, and other appliances', 'Appliance Repair', 900.00, '/images/services/appliance.png'),
    ('Telephone Repair', 'Professional telephone and mobile repair services', 'Electronics', 600.00, '/images/services/telephone-repair.png'),
    ('Computer Repair', 'Expert computer and laptop repair services', 'Electronics', 800.00, '/images/services/computer-repair.png')
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

-- Create service_requests table if not exists
CREATE TABLE IF NOT EXISTS service_requests (
    request_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id),
    service_type TEXT NOT NULL,
    description TEXT,
    location POINT,
    status TEXT DEFAULT 'pending',
    assigned_worker INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_worker_profiles_worker_id ON worker_profiles(worker_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned_worker ON service_requests(assigned_worker);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
