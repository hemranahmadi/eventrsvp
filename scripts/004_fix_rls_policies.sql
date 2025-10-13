-- Fix RLS policies for events and rsvps tables

-- First, drop all existing policies
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Hosts can update their own events" ON public.events;
DROP POLICY IF EXISTS "Hosts can delete their own events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view rsvps" ON public.rsvps;
DROP POLICY IF EXISTS "Anyone can create rsvps" ON public.rsvps;
DROP POLICY IF EXISTS "Guests can update their own rsvps" ON public.rsvps;

-- Ensure RLS is enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Events table policies
CREATE POLICY "Anyone can view events"
  ON public.events
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their own events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_user_id)
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can delete their own events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = host_user_id);

-- RSVPs table policies
CREATE POLICY "Anyone can view rsvps"
  ON public.rsvps
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create rsvps"
  ON public.rsvps
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rsvps"
  ON public.rsvps
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete rsvps"
  ON public.rsvps
  FOR DELETE
  USING (true);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
