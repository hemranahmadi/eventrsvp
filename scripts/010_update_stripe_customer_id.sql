-- Update user_profiles table to use stripe_customer_id instead of square_customer_id
ALTER TABLE user_profiles 
  RENAME COLUMN square_customer_id TO stripe_customer_id;

-- Update the comment on the column
COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'Stripe customer ID for subscription management';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
