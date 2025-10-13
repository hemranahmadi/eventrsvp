-- Ensure all required columns exist in the events table
-- Add columns if they don't exist (won't fail if they already exist)

-- Add deadline column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'deadline'
  ) THEN
    ALTER TABLE events ADD COLUMN deadline TEXT;
    RAISE NOTICE 'Added deadline column';
  ELSE
    RAISE NOTICE 'deadline column already exists';
  END IF;
END $$;

-- Add time column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'time'
  ) THEN
    ALTER TABLE events ADD COLUMN "time" TEXT;
    RAISE NOTICE 'Added time column';
  ELSE
    RAISE NOTICE 'time column already exists';
  END IF;
END $$;

-- Add active column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'active'
  ) THEN
    ALTER TABLE events ADD COLUMN active BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added active column';
  ELSE
    RAISE NOTICE 'active column already exists';
  END IF;
END $$;

-- Verify all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'events'
ORDER BY ordinal_position;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
