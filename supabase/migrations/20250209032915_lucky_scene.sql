/*
  # Add language and CSRF token fields

  1. Changes
    - Add language column to users table
    - Add csrf_token column to users table
    - Update existing policies
  
  2. Security
    - Maintain existing RLS policies
    - Add index for language column
*/

-- Add new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt-BR';
ALTER TABLE users ADD COLUMN IF NOT EXISTS csrf_token text;

-- Add index for language column
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);

-- Update registration query
ALTER TABLE users ALTER COLUMN language SET DEFAULT 'pt-BR';