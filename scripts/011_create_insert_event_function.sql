-- Create a PostgreSQL function to insert events
-- This bypasses PostgREST's schema cache by using direct SQL
CREATE OR REPLACE FUNCTION insert_event(
  p_title TEXT,
  p_description TEXT,
  p_date TEXT,
  p_time TEXT,
  p_location TEXT,
  p_guest_limit INTEGER,
  p_deadline TEXT,
  p_host_name TEXT,
  p_host_email TEXT,
  p_host_user_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  date TEXT,
  time TEXT,
  location TEXT,
  guest_limit INTEGER,
  deadline TEXT,
  host_name TEXT,
  host_email TEXT,
  host_user_id UUID,
  active BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO events (
    title,
    description,
    date,
    time,
    location,
    guest_limit,
    deadline,
    host_name,
    host_email,
    host_user_id,
    active
  ) VALUES (
    p_title,
    p_description,
    p_date,
    p_time,
    p_location,
    p_guest_limit,
    p_deadline,
    p_host_name,
    p_host_email,
    p_host_user_id,
    true
  )
  RETURNING 
    events.id,
    events.title,
    events.description,
    events.date,
    events.time,
    events.location,
    events.guest_limit,
    events.deadline,
    events.host_name,
    events.host_email,
    events.host_user_id,
    events.active,
    events.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_event TO authenticated;
