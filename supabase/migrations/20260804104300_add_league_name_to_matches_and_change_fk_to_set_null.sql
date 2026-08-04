/*
# Add league_name column to matches and change tournament FK to SET NULL

## Purpose
Allow archived leagues to be deleted while preserving player stats and match history.
When an archived league is deleted, matches and match_results survive with tournament_id set to NULL.
The stored league_name column retains the league name for display in match history.

## Changes
1. Add `league_name` (text, nullable) to `matches` table
2. Backfill `league_name` from the linked tournament's name
3. Make `tournament_id` nullable (was NOT NULL)
4. Drop the existing CASCADE foreign key on `tournament_id`
5. Re-create the foreign key with ON DELETE SET NULL

## Important Notes
- match_results cascade from matches (not from tournaments), so they survive
- group_id FK on matches already uses SET NULL
- Player stats remain intact because the stats trigger only fires on match_results changes
*/

-- 1. Add league_name column
ALTER TABLE matches ADD COLUMN IF NOT EXISTS league_name text;

-- 2. Backfill league_name from tournaments
UPDATE matches
SET league_name = t.name
FROM tournaments t
WHERE matches.tournament_id = t.id
  AND matches.league_name IS NULL;

-- 3. Make tournament_id nullable
ALTER TABLE matches ALTER COLUMN tournament_id DROP NOT NULL;

-- 4. Drop the existing CASCADE FK
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_tournament_id_fkey;

-- 5. Re-create with SET NULL
ALTER TABLE matches
  ADD CONSTRAINT matches_tournament_id_fkey
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL;
