/*
  # Add Activity Logging Triggers

  1. Changes
    - Add triggers for user actions:
      - Login
      - API Key changes
      - PIN changes
      - Password changes
      - Credit changes
      - User management (admin actions)
      - Account deletion
    
  2. Security
    - Triggers run with security definer
    - Only track specified actions
    - Sanitize sensitive information
*/

-- Trigger for user logins
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS trigger AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'Login',
    'User logged into the system'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER user_login_trigger
  AFTER UPDATE OF last_login ON users
  FOR EACH ROW
  WHEN (OLD.last_login IS DISTINCT FROM NEW.last_login)
  EXECUTE FUNCTION log_user_login();

-- Trigger for API key changes
CREATE OR REPLACE FUNCTION log_api_key_change()
RETURNS trigger AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'API Key Changed',
    'API key was reset'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER api_key_change_trigger
  AFTER UPDATE OF api_key ON users
  FOR EACH ROW
  WHEN (OLD.api_key IS DISTINCT FROM NEW.api_key)
  EXECUTE FUNCTION log_api_key_change();

-- Trigger for PIN changes
CREATE OR REPLACE FUNCTION log_pin_change()
RETURNS trigger AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'PIN Changed',
    'Security PIN was updated'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER pin_change_trigger
  AFTER UPDATE OF pin ON users
  FOR EACH ROW
  WHEN (OLD.pin IS DISTINCT FROM NEW.pin)
  EXECUTE FUNCTION log_pin_change();

-- Trigger for credit changes
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
    format('Amount: $%s', change_amount)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER credit_change_trigger
  AFTER UPDATE OF credits ON users
  FOR EACH ROW
  WHEN (OLD.credits IS DISTINCT FROM NEW.credits)
  EXECUTE FUNCTION log_credit_change();

-- Trigger for admin status changes
CREATE OR REPLACE FUNCTION log_admin_status_change()
RETURNS trigger AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'Admin Status Changed',
    CASE 
      WHEN NEW.is_admin THEN 'User promoted to administrator'
      ELSE 'Administrator privileges removed'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER admin_status_change_trigger
  AFTER UPDATE OF is_admin ON users
  FOR EACH ROW
  WHEN (OLD.is_admin IS DISTINCT FROM NEW.is_admin)
  EXECUTE FUNCTION log_admin_status_change();

-- Trigger for user ban status changes
CREATE OR REPLACE FUNCTION log_ban_status_change()
RETURNS trigger AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'Ban Status Changed',
    CASE 
      WHEN NEW.banned THEN 'User was banned'
      ELSE 'User was unbanned'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER ban_status_change_trigger
  AFTER UPDATE OF banned ON users
  FOR EACH ROW
  WHEN (OLD.banned IS DISTINCT FROM NEW.banned)
  EXECUTE FUNCTION log_ban_status_change();

-- Update top users view to format credits with dollar sign
CREATE OR REPLACE VIEW top_users_by_credits AS
SELECT 
  username,
  credits,
  format('$%s', credits) as formatted_credits
FROM users
WHERE banned = false
ORDER BY credits DESC
LIMIT 10;