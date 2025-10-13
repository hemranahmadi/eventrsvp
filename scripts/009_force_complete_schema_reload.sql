-- Force complete PostgREST schema cache reload
-- This script uses multiple methods to ensure PostgREST recognizes all columns

-- Method 1: Send NOTIFY to PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Method 2: Update table comments to trigger schema change detection
COMMENT ON TABLE public.events IS 'Events table - schema reloaded at ' || NOW()::text;
COMMENT ON TABLE public.rsvps IS 'RSVPs table - schema reloaded at ' || NOW()::text;
COMMENT ON TABLE public.user_profiles IS 'User profiles table - schema reloaded at ' || NOW()::text;

-- Method 3: Update column comments to force recognition
COMMENT ON COLUMN public.events.host_user_id IS 'Host user ID from auth.users';
COMMENT ON COLUMN public.events.active IS 'Whether the event is active';
COMMENT ON COLUMN public.events.deadline IS 'RSVP deadline date and time';

-- Method 4: Run ANALYZE to update statistics
ANALYZE public.events;
ANALYZE public.rsvps;
ANALYZE public.user_profiles;

-- Method 5: Verify columns exist
DO $$
BEGIN
  -- Check if host_user_id exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'host_user_id'
  ) THEN
    RAISE NOTICE 'Column host_user_id exists in events table';
  ELSE
    RAISE EXCEPTION 'Column host_user_id does NOT exist in events table';
  END IF;

  -- Check if active exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'active'
  ) THEN
    RAISE NOTICE 'Column active exists in events table';
  ELSE
    RAISE EXCEPTION 'Column active does NOT exist in events table';
  END IF;
END $$;

-- Method 6: List all columns in events table for verification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'events'
ORDER BY ordinal_position;
