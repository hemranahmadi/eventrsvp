-- Create RPC function to insert user profiles using dynamic SQL to bypass schema cache
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Use EXECUTE with format() to bypass schema cache
  EXECUTE format(
    'INSERT INTO user_profiles (id, %I, %I) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
    'is_premium',
    'subscription_status'
  ) USING p_user_id, false, 'free';
  
  -- Return success result
  SELECT json_build_object(
    'id', p_user_id,
    'is_premium', false,
    'subscription_status', 'free',
    'success', true
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error but don't fail
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(UUID) TO anon;
