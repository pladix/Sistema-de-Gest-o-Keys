/*
  # Create activities table and top users view

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `action` (text)
      - `details` (text)
      - `created_at` (timestamp)

  2. New Views
    - `top_users_by_credits`
      - Shows users ordered by credits (descending)
      - Only shows username and credits
      - Limited to top 10 users

  3. Security
    - Enable RLS on activities table
    - Add policies for authenticated users
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own activities"
  ON activities
  FOR SELECT
  TO public
  USING (user_id = auth.uid() OR 
         user_id IN (
           SELECT id FROM users WHERE is_admin = true
         ));

-- Create view for top users
CREATE OR REPLACE VIEW top_users_by_credits AS
SELECT 
  username,
  credits
FROM users
WHERE banned = false
ORDER BY credits DESC
LIMIT 10;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id uuid,
  p_action text,
  p_details text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO activities (user_id, action, details)
  VALUES (p_user_id, p_action, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;