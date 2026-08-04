/*
# Auto-populate league_name on match insert/update

## Purpose
Automatically copies the tournament name into matches.league_name whenever a match is
created or its tournament_id is changed. This ensures the league_name is always populated
without requiring application code changes at every insert/update site.

## Changes
1. Creates a trigger function `sync_match_league_name()` that looks up the tournament name
   and writes it to `NEW.league_name`.
2. Attaches a BEFORE INSERT OR UPDATE trigger on the `matches` table.

## Important Notes
- Only sets league_name when tournament_id is not null
- Fires before insert/update so the value is set before the row is written
*/

CREATE OR REPLACE FUNCTION sync_match_league_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tournament_id IS NOT NULL THEN
    SELECT name INTO NEW.league_name
    FROM tournaments
    WHERE id = NEW.tournament_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_match_league_name ON matches;
CREATE TRIGGER trg_sync_match_league_name
  BEFORE INSERT OR UPDATE OF tournament_id ON matches
  FOR EACH ROW
  EXECUTE FUNCTION sync_match_league_name();
