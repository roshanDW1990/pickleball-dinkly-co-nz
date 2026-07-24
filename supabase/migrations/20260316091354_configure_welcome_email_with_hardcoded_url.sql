/*
  # Configure Welcome Email with Hardcoded URL
  
  1. Changes
    - Update trigger to use hardcoded Supabase URL
    - This is the simplest approach for now
    - Edge function doesn't require authentication for this public endpoint
    
  2. Important Notes
    - Requires RESEND_API_KEY to be configured in edge function secrets
    - Edge function must be deployed: send-welcome-email
    - Errors in sending email won't prevent user registration (fire and forget)
*/

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS on_profile_created_send_welcome_email ON public.profiles;
DROP FUNCTION IF EXISTS public.send_welcome_email_trigger();

-- Create the function with hardcoded URL
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Make async HTTP POST request to edge function using pg_net
  -- This won't block the user registration even if it fails
  SELECT INTO request_id net.http_post(
    url := 'https://zebmqaffhnnuqfzcqkjq.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
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