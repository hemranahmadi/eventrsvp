-- Force PostgREST to reload the schema cache
-- Run this whenever you get "column does not exist" errors for columns that actually exist

-- Adding multiple methods to force schema reload
-- Send reload notification to PostgREST
NOTIFY pgrst, 'reload schema';

-- Force schema cache refresh by modifying table metadata
COMMENT ON TABLE public.events IS 'Events table - stores event information (updated)';
COMMENT ON TABLE public.rsvps IS 'RSVPs table - stores guest responses';
COMMENT ON TABLE public.user_profiles IS 'User profiles table - stores subscription data';

-- Verify all critical columns exist
SELECT 'events.host_user_id' as column_check, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'events' 
  AND column_name = 'host_user_id'

UNION ALL

SELECT 'user_profiles.is_premium' as column_check, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles' 
  AND column_name = 'is_premium';

-- Force a schema cache refresh by updating table statistics
ANALYZE public.events;
ANALYZE public.rsvps;
ANALYZE public.user_profiles;
