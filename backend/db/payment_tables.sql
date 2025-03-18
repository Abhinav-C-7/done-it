-- Create payment_requests table
CREATE TABLE IF NOT EXISTS payment_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(255) NOT NULL,
    customer_id INTEGER NOT NULL,
    serviceman_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Create index on customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_requests_customer_id ON payment_requests(customer_id);

-- Create index on request_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_requests_request_id ON payment_requests(request_id);

-- Add status column to payments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'status'
    ) THEN
        ALTER TABLE payments ADD COLUMN status VARCHAR(50) DEFAULT 'completed';
    END IF;
END $$;

-- Add payment_type column to payments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'payment_type'
    ) THEN
        ALTER TABLE payments ADD COLUMN payment_type VARCHAR(50) DEFAULT 'service_payment';
    END IF;
END $$;

-- Add service_type column to payments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'service_type'
    ) THEN
        ALTER TABLE payments ADD COLUMN service_type VARCHAR(255);
    END IF;
END $$;
