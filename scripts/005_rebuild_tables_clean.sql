-- Complete rebuild of tables to fix schema cache issues
-- Run this script to start fresh

-- Step 1: Drop everything
DROP TABLE IF EXISTS public.rsvps CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Step 2: Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL,
  host_email TEXT NOT NULL,
  guest_limit INTEGER,
  deadline TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create rsvps table
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  attending BOOLEAN NOT NULL DEFAULT true,
  party_size INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, guest_email)
);

-- Step 4: Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for events
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_user_id);

CREATE POLICY "Hosts can delete their events"
  ON public.events FOR DELETE
  TO authenticated
  USING (auth.uid() = host_user_id);

-- Step 6: Create RLS policies for rsvps
CREATE POLICY "Anyone can view rsvps"
  ON public.rsvps FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create rsvps"
  ON public.rsvps FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rsvps"
  ON public.rsvps FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete rsvps"
  ON public.rsvps FOR DELETE
  USING (true);

-- Step 7: Create indexes
CREATE INDEX events_host_user_id_idx ON public.events(host_user_id);
CREATE INDEX events_created_at_idx ON public.events(created_at);
CREATE INDEX rsvps_event_id_idx ON public.rsvps(event_id);
CREATE INDEX rsvps_guest_email_idx ON public.rsvps(guest_email);

-- Step 8: Force schema reload
NOTIFY pgrst, 'reload schema';
