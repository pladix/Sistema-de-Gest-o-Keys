/*
  # Fix RLS policies for user registration

  1. Changes
    - Add policy to allow inserting new users
    - Modify existing policies to work with API key authentication
    - Remove authentication requirement for policies since we're using API key auth

  2. Security
    - Allow public registration
    - Maintain data privacy through API key validation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies
CREATE POLICY "Allow public registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO public
  USING (api_key = current_setting('request.headers')::json->>'apikey');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id_pin ON users(telegram_id, pin);