-- Add email verification and Firebase UID columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255);
