/*
  # Add Welcome Email Trigger

  1. Changes
    - Creates a trigger function that calls the send-welcome-email edge function
    - Adds a trigger on profiles table that fires after insert
    - Automatically sends welcome emails to new users upon registration

  2. Security
    - Function executes with security definer privileges
    - Only triggers on new profile creation
*/

-- Create function to invoke the welcome email edge function
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  service_role_key text;
  supabase_url text;
BEGIN
  -- Get Supabase URL and service role key from vault or environment
  -- These are automatically available in Supabase
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- Call the edge function asynchronously using pg_net extension
  PERFORM
    net.http_post(
      url := supabase_url || '/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'name', COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.email)
      )
    );

  RETURN NEW;
END;
$$;

-- Create trigger that fires after a new profile is inserted
DROP TRIGGER IF EXISTS on_profile_created_send_welcome_email ON public.profiles;

CREATE TRIGGER on_profile_created_send_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_trigger();
