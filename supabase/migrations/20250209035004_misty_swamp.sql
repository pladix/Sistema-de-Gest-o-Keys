/*
  # Add user management fields

  1. New Fields
    - `is_admin` (boolean) - Indicates if user is an administrator
    - `credits` (integer) - User's credit balance
    - `last_api_key_reset` (timestamptz) - Last time API key was reset
    - `banned` (boolean) - User ban status

  2. Security
    - Add RLS policies for admin actions
*/

-- Add new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_api_key_reset timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(banned);