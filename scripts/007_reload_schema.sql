-- Force PostgREST to reload the schema cache
-- Run this whenever you get "column does not exist" errors for columns that actually exist

NOTIFY pgrst, 'reload schema';

-- Also refresh the schema cache by touching the events table
COMMENT ON TABLE public.events IS 'Events table - stores event information';

-- Verify the host_user_id column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'events' 
  AND column_name = 'host_user_id';
