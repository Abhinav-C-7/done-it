-- Drop database if exists (uncomment if needed)
-- DROP DATABASE IF EXISTS ondemand_service;

-- Create database
CREATE DATABASE ondemand_service;

\c ondemand_service

-- Enable PostGIS extension if not enabled
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (both customers and workers)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('customer', 'worker')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker profiles
CREATE TABLE worker_profiles (
    worker_id INTEGER PRIMARY KEY REFERENCES users(user_id),
    skills TEXT[] NOT NULL,
    availability BOOLEAN DEFAULT true,
    current_location POINT,
    rating DECIMAL(3,2) DEFAULT 0,
    verified BOOLEAN DEFAULT false
);

-- Services catalog
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Insert some initial services
INSERT INTO services (title, description, category, base_price, image_url) VALUES
    ('Basic Home Cleaning', 'Professional home cleaning service including dusting, vacuuming, and sanitizing', 'Cleaning', 200.00, '/images/services/cleaning-service.jpg'),
    ('Deep Home Cleaning', 'Complete deep cleaning service for your home', 'Cleaning', 400.00, '/images/services/deep-cleaning.jpg'),
    ('Basic Plumbing Service', 'Professional plumbing repair and maintenance', 'Plumbing', 299.00, '/images/services/plumbing.jpg'),
    ('Emergency Plumbing', '24/7 emergency plumbing service', 'Plumbing', 499.00, '/images/services/emergency-plumbing.jpg'),
    ('Fan Installation', 'Professional ceiling fan installation service', 'Electrical', 50.00, '/images/services/fan.jpg'),
    ('Electrical Wiring', 'New wiring installation and repair services', 'Electrical', 399.00, '/images/services/electrical.jpg'),
    ('AC Regular Service', 'Complete check-up & cleaning of your AC unit', 'AC', 499.00, '/images/services/ac-service.jpg'),
    ('AC Repair & Gas Refill', 'Professional diagnosis & repair service with gas refill if needed', 'AC', 699.00, '/images/services/ac-repair.jpg'),
    ('AC Installation', 'Professional AC installation with proper mounting and testing', 'AC', 999.00, '/images/services/ac-install.jpg'),
    ('Basic Painting', 'Professional interior and exterior painting service', 'Painting', 599.00, '/images/services/painting.jpg'),
    ('Computer Repair Service', 'Professional computer repair and maintenance', 'Computer Repair', 799.00, '/images/services/computer-repair.jpg'),
    ('Advanced Computer Service', 'Advanced computer diagnostics and repair', 'Computer Repair', 1499.00, '/images/services/computer-advanced.jpg'),
    ('Phone Repair Service', 'Professional phone repair and screen replacement', 'Phone Repair', 499.00, '/images/services/phone-repair.jpg'),
    ('Advanced Phone Repair', 'Advanced phone repair including motherboard service', 'Phone Repair', 999.00, '/images/services/phone-advanced.jpg'),
    ('Basic Landscaping', 'Professional lawn care and garden maintenance', 'Landscaping', 1999.00, '/images/services/landscaping.jpg'),
    ('Premium Landscaping', 'Complete landscape design and renovation', 'Landscaping', 3999.00, '/images/services/landscaping-premium.jpg'),
    ('Basic Pest Control', 'Essential pest control treatment', 'Pest Control', 999.00, '/images/services/pest-control.jpg'),
    ('Advanced Pest Control', 'Comprehensive pest elimination service', 'Pest Control', 1999.00, '/images/services/pest-control-advanced.jpg');

-- Service requests
CREATE TABLE service_requests (
    request_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(user_id),
    service_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location POINT NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_worker INTEGER REFERENCES users(user_id),
    estimated_price DECIMAL(10,2)
);

-- Reviews
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    service_request_id INTEGER REFERENCES service_requests(request_id),
    customer_id INTEGER REFERENCES users(user_id),
    worker_id INTEGER REFERENCES users(user_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
