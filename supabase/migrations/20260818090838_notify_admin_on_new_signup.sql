DROP TRIGGER IF EXISTS on_profile_created_notify_admin ON public.profiles;
DROP FUNCTION IF EXISTS public.notify_admin_new_member();

CREATE OR REPLACE FUNCTION public.notify_admin_new_member()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE request_id bigint;
BEGIN
  SELECT INTO request_id net.http_post(
    url := 'https://zebmqaffhnnuqfzcqkjq.supabase.co/functions/v1/send-new-member-notification',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'email', NEW.email,
      'firstName', COALESCE(NEW.first_name, 'Player'),
      'lastName', COALESCE(NEW.last_name, ''),
      'phoneNumber', NEW.phone_number,
      'location', NEW.location,
      'createdAt', NEW.created_at
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to queue admin notification: %', SQLERRM;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_profile_created_notify_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_member();
