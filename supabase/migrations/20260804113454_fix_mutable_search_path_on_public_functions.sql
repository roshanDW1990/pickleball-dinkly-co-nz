/*
# Fix mutable search_path on public functions

## Summary
Sets an explicit search_path on all public schema functions to prevent
potential search_path manipulation attacks.

## Security Changes
- All 5 public functions now have SET search_path = public, pg_temp.
- The 2 SECURITY DEFINER functions (recalculate_player_stats, sync_auth_email_to_profile)
  are the highest priority since they run with elevated privileges.
- The 3 SECURITY INVOKER functions (sync_match_league_name,
  update_tournament_registrations_updated_at, update_updated_at_column) are also
  hardened for completeness.

## Important Notes
1. Function bodies and behaviour are unchanged — only the search_path is pinned.
2. This addresses the "Function Search Path Mutable" security advisory warnings.
*/

-- recalculate_player_stats (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.recalculate_player_stats(player_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  played_count INTEGER;
  won_count    INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO played_count
  FROM match_results mr
  JOIN matches m ON mr.match_id = m.id
  WHERE mr.status = 'approved'
    AND (m.player1_id = player_uuid OR m.player2_id = player_uuid);

  SELECT COUNT(*)
  INTO won_count
  FROM match_results mr
  WHERE mr.status = 'approved'
    AND mr.winner_id = player_uuid;

  UPDATE profiles
  SET
    matches_played = played_count,
    matches_won    = won_count,
    matches_lost   = played_count - won_count
  WHERE id = player_uuid;
END;
$$;

-- sync_auth_email_to_profile (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.sync_auth_email_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- sync_match_league_name (SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.sync_match_league_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.tournament_id IS NOT NULL THEN
    SELECT name INTO NEW.league_name
    FROM tournaments
    WHERE id = NEW.tournament_id;
  END IF;
  RETURN NEW;
END;
$$;

-- update_tournament_registrations_updated_at (SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.update_tournament_registrations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- update_updated_at_column (SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
