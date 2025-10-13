-- Create a PostgreSQL function to fetch events using dynamic SQL
-- This bypasses PostgREST's schema cache issues
CREATE OR REPLACE FUNCTION get_events_dynamic(p_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Use dynamic SQL to fetch events
  IF p_user_id IS NULL THEN
    -- Fetch all events
    EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM events ORDER BY created_at DESC) t'
    INTO result;
  ELSE
    -- Fetch events for specific user
    EXECUTE format('SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM events WHERE host_user_id = %L ORDER BY created_at DESC) t', p_user_id)
    INTO result;
  END IF;
  
  -- Return empty array if no events found
  IF result IS NULL THEN
    result := '[]'::JSON;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
