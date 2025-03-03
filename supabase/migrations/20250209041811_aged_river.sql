/*
  # Fix Activity Logging and Real-time Updates

  1. Changes
    - Add realtime subscriptions for activities
    - Fix activity logging triggers
    - Add missing RLS policies
    - Update top users view
    
  2. Security
    - Add proper RLS policies
    - Fix security definer functions
*/

-- Drop existing triggers and functions to recreate them
DROP TRIGGER IF EXISTS user_login_trigger ON users;
DROP TRIGGER IF EXISTS api_key_change_trigger ON users;
DROP TRIGGER IF EXISTS pin_change_trigger ON users;
DROP TRIGGER IF EXISTS credit_change_trigger ON users;
DROP TRIGGER IF EXISTS admin_status_change_trigger ON users;
DROP TRIGGER IF EXISTS ban_status_change_trigger ON users;

DROP FUNCTION IF EXISTS log_user_login();
DROP FUNCTION IF EXISTS log_api_key_change();
DROP FUNCTION IF EXISTS log_pin_change();
DROP FUNCTION IF EXISTS log_credit_change();
DROP FUNCTION IF EXISTS log_admin_status_change();
DROP FUNCTION IF EXISTS log_ban_status_change();

-- Enable realtime for activities
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- Update activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS admin_action boolean DEFAULT false;

-- Update log_activity function to include admin actions
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id uuid,
  p_action text,
  p_details text DEFAULT NULL,
  p_admin_action boolean DEFAULT false
) RETURNS void AS $$
BEGIN
  INSERT INTO activities (user_id, action, details, admin_action)
  VALUES (p_user_id, p_action, p_details, p_admin_action);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers with improved logging
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS trigger AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'Login',
    format('Login at %s', now()::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER user_login_trigger
  AFTER UPDATE OF last_login ON users
  FOR EACH ROW
  WHEN (OLD.last_login IS DISTINCT FROM NEW.last_login)
  EXECUTE FUNCTION log_user_login();

CREATE OR REPLACE FUNCTION log_api_key_change()
RETURNS trigger AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'API Key Changed',
    format('API key reset at %s', now()::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER api_key_change_trigger
  AFTER UPDATE OF api_key ON users
  FOR EACH ROW
  WHEN (OLD.api_key IS DISTINCT FROM NEW.api_key)
  EXECUTE FUNCTION log_api_key_change();

CREATE OR REPLACE FUNCTION log_pin_change()
RETURNS trigger AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'PIN Changed',
    format('PIN updated at %s', now()::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER pin_change_trigger
  AFTER UPDATE OF pin ON users
  FOR EACH ROW
  WHEN (OLD.pin IS DISTINCT FROM NEW.pin)
  EXECUTE FUNCTION log_pin_change();

CREATE OR REPLACE FUNCTION log_credit_change()
RETURNS trigger AS $$
DECLARE
  change_amount integer;
  action_type text;
BEGIN
  change_amount := NEW.credits - OLD.credits;
  
  IF change_amount > 0 THEN
    action_type := 'Credits Added';
  ELSE
    action_type := 'Credits Removed';
    change_amount := ABS(change_amount);
  END IF;

  PERFORM log_activity(
    NEW.id,
    action_type,
    format('Amount: $%s at %s', change_amount, now()::text),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER credit_change_trigger
  AFTER UPDATE OF credits ON users
  FOR EACH ROW
  WHEN (OLD.credits IS DISTINCT FROM NEW.credits)
  EXECUTE FUNCTION log_credit_change();

CREATE OR REPLACE FUNCTION log_admin_status_change()
RETURNS trigger AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'Admin Status Changed',
    CASE 
      WHEN NEW.is_admin THEN format('Promoted to administrator at %s', now()::text)
      ELSE format('Administrator privileges removed at %s', now()::text)
    END,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER admin_status_change_trigger
  AFTER UPDATE OF is_admin ON users
  FOR EACH ROW
  WHEN (OLD.is_admin IS DISTINCT FROM NEW.is_admin)
  EXECUTE FUNCTION log_admin_status_change();

CREATE OR REPLACE FUNCTION log_ban_status_change()
RETURNS trigger AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'Ban Status Changed',
    CASE 
      WHEN NEW.banned THEN format('User banned at %s', now()::text)
      ELSE format('User unbanned at %s', now()::text)
    END,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ban_status_change_trigger
  AFTER UPDATE OF banned ON users
  FOR EACH ROW
  WHEN (OLD.banned IS DISTINCT FROM NEW.banned)
  EXECUTE FUNCTION log_ban_status_change();

-- Update RLS policies for activities
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;

CREATE POLICY "Users can view their own activities"
  ON activities
  FOR SELECT
  TO public
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Update top users view
CREATE OR REPLACE VIEW top_users_by_credits AS
SELECT 
  username,
  credits,
  format('$%s', credits) as formatted_credits
FROM users
WHERE banned = false
ORDER BY credits DESC
LIMIT 10;