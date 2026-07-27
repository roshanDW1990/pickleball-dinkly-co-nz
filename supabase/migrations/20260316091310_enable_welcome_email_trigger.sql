/*
  # Enable Welcome Email Trigger
  
  1. Changes
    - Re-enable the welcome email trigger to actually call the edge function
    - Use pg_net extension to make HTTP POST request to the send-welcome-email edge function
    - Background job runs asynchronously so it won't block user registration
    
  2. Important Notes
    - Requires RESEND_API_KEY to be configured in edge function secrets
    - Edge function must be deployed: send-welcome-email
    - Uses service role key to authenticate the request to the edge function
    - Errors in sending email won't prevent user registration (fire and forget)
*/

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS on_profile_created_send_welcome_email ON public.profiles;
DROP FUNCTION IF EXISTS public.send_welcome_email_trigger();

-- Create the function to actually send emails
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  request_id bigint;
BEGIN
  -- Get the Supabase URL (you can hardcode this or get from settings)
  -- The edge function URL format is: https://<project-ref>.supabase.co/functions/v1/send-welcome-email
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- If settings are not configured, try to build URL from current database
  -- This is a fallback but may not work in all environments
  IF supabase_url IS NULL OR service_role_key IS NULL THEN
    -- Skip sending email if configuration is missing
    -- This prevents blocking user registration
    RAISE WARNING 'Supabase URL or service role key not configured, skipping welcome email';
    RETURN NEW;
  END IF;
  
  -- Make async HTTP POST request to edge function using pg_net
  -- This won't block the user registration even if it fails
  SELECT INTO request_id net.http_post(
    url := supabase_url || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'email', NEW.email,
      'firstName', COALESCE(NEW.first_name, 'Player'),
      'lastName', COALESCE(NEW.last_name, '')
    )
  );
  
  -- Log the request ID for debugging
  RAISE LOG 'Welcome email request queued with ID: %', request_id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user registration
    RAISE WARNING 'Failed to queue welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_profile_created_send_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_trigger();