-- Check current status
SELECT registration_id, email, full_name, status FROM serviceman_registrations 
WHERE email = 'abhinavc038@serviceman.doneit.com';

-- Update status to approved
UPDATE serviceman_registrations 
SET status = 'approved' 
WHERE email = 'abhinavc038@serviceman.doneit.com';

-- Verify the update
SELECT registration_id, email, full_name, status FROM serviceman_registrations 
WHERE email = 'abhinavc038@serviceman.doneit.com';
