-- Add job_status column to service_requests table
ALTER TABLE public.service_requests
ADD COLUMN job_status text DEFAULT 'pending'::text;

-- Update existing records to have the default status
UPDATE public.service_requests
SET job_status = 'pending'
WHERE job_status IS NULL;

-- Comment explaining the purpose of this change
COMMENT ON COLUMN public.service_requests.job_status IS 'Tracks the progress of a job (pending, on_the_way, arrived, in_progress, completed)';
