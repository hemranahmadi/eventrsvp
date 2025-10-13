-- Create a function that uses dynamic SQL to bypass schema cache
-- This completely bypasses PostgREST's schema validation
CREATE OR REPLACE FUNCTION insert_event_dynamic(
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
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
  v_result JSON;
BEGIN
  -- Generate a new UUID for the event
  v_id := gen_random_uuid();
  
  -- Added host_id column to match actual database schema
  -- Cast date to timestamp with time zone to match column type
  -- Use EXECUTE to bypass schema cache completely
  EXECUTE format(
    'INSERT INTO events (id, title, description, date, %I, location, host_id, guest_limit, %I, host_name, host_email, host_user_id, %I, created_at) VALUES ($1, $2, $3, $4::timestamptz, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())',
    'time', 'deadline', 'active'
  ) USING v_id, p_title, p_description, p_date, p_time, p_location, p_host_user_id, p_guest_limit, p_deadline, p_host_name, p_host_email, p_host_user_id, true;
  
  -- Return the created event as JSON
  SELECT json_build_object(
    'id', v_id,
    'title', p_title,
    'description', p_description,
    'date', p_date,
    'time', p_time,
    'location', p_location,
    'guest_limit', p_guest_limit,
    'deadline', p_deadline,
    'host_name', p_host_name,
    'host_email', p_host_email,
    'host_user_id', p_host_user_id,
    'active', true
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_event_dynamic TO authenticated;
