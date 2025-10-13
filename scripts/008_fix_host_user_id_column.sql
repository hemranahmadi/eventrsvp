-- Diagnostic and fix script for host_user_id column issue
-- This script will check if the column exists and add it if needed

-- Step 1: Check if column exists
DO $$
BEGIN
    -- Check if host_user_id column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'events' 
        AND column_name = 'host_user_id'
    ) THEN
        -- Column doesn't exist, add it
        RAISE NOTICE 'Adding host_user_id column...';
        ALTER TABLE public.events 
        ADD COLUMN host_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Create index
        CREATE INDEX IF NOT EXISTS events_host_user_id_idx ON public.events(host_user_id);
        
        RAISE NOTICE 'Column added successfully!';
    ELSE
        RAISE NOTICE 'Column host_user_id already exists';
    END IF;
END $$;

-- Step 2: Verify column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'events'
AND column_name = 'host_user_id';

-- Step 3: Force aggressive schema reload
-- Method 1: NOTIFY
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Method 2: Update table comment to trigger cache invalidation
COMMENT ON TABLE public.events IS 'Events table - schema reloaded';

-- Method 3: ANALYZE to update statistics
ANALYZE public.events;

-- Method 4: Refresh materialized views if any
-- (This forces PostgREST to re-examine the schema)

-- Step 4: Show all columns in events table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'events'
ORDER BY ordinal_position;
