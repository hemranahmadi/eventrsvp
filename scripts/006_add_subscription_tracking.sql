-- Add subscription tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS square_customer_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_square_customer_id ON users(square_customer_id);

-- Add RLS policies for subscription data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription status
CREATE POLICY IF NOT EXISTS "Users can view own subscription" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can update their own data (but subscription status should only be updated via webhook)
CREATE POLICY IF NOT EXISTS "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);
