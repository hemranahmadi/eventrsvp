-- Create a PostgreSQL function to insert events
-- This bypasses PostgREST's schema cache by using direct SQL

-- Drop the function if it exists
DROP FUNCTION IF EXISTS insert_event;

-- Create the function with simpler return type
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
RETURNS JSON AS $$
DECLARE
  new_event JSON;
BEGIN
  -- Quote "time" and "active" column names since they are reserved keywords in PostgreSQL
  INSERT INTO events (
    title,
    description,
    date,
    "time",
    location,
    guest_limit,
    deadline,
    host_name,
    host_email,
    host_user_id,
    "active"
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
  RETURNING json_build_object(
    'id', id,
    'title', title,
    'description', description,
    'date', date,
    'time', "time",
    'location', location,
    'guest_limit', guest_limit,
    'deadline', deadline,
    'host_name', host_name,
    'host_email', host_email,
    'host_user_id', host_user_id,
    'active', "active",
    'created_at', created_at
  ) INTO new_event;
  
  RETURN new_event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_event(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, UUID) TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
