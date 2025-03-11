-- Add profile_picture column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add profile_picture column to serviceman_profiles table
ALTER TABLE public.serviceman_profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;
