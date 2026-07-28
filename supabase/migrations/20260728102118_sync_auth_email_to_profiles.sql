/*
# Sync auth email changes to profiles table

1. New Function
   - `sync_auth_email_to_profile()` trigger function
   - Fires AFTER UPDATE on `auth.users`
   - When a user confirms a new email, automatically updates the `profiles.email` column to match

2. New Trigger
   - `on_auth_user_email_change` on `auth.users`
   - Ensures the profiles table always reflects the current verified email

3. Important Notes
   - This keeps the profile email in sync without requiring the frontend to do a second update
   - Only fires when the email column actually changes
*/

CREATE OR REPLACE FUNCTION public.sync_auth_email_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email, updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_change ON auth.users;
CREATE TRIGGER on_auth_user_email_change
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_email_to_profile();
