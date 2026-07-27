/*
  # Update match_results table for pickleball scoring

  1. Changes
    - Add columns for best-of-3 sets scoring
      - `player1_set1_score` (integer)
      - `player1_set2_score` (integer)
      - `player1_set3_score` (integer, nullable)
      - `player2_set1_score` (integer)
      - `player2_set2_score` (integer)
      - `player2_set3_score` (integer, nullable)
    - Add `location` column for where the match was played
    - Add `comments` column for player comments
    - Keep existing columns for backward compatibility

  2. Security
    - Policies already exist, no changes needed
*/

-- Add pickleball scoring columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_results' AND column_name = 'player1_set1_score'
  ) THEN
    ALTER TABLE match_results ADD COLUMN player1_set1_score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_results' AND column_name = 'player1_set2_score'
  ) THEN
    ALTER TABLE match_results ADD COLUMN player1_set2_score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_results' AND column_name = 'player1_set3_score'
  ) THEN
    ALTER TABLE match_results ADD COLUMN player1_set3_score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_results' AND column_name = 'player2_set1_score'
  ) THEN
    ALTER TABLE match_results ADD COLUMN player2_set1_score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_results' AND column_name = 'player2_set2_score'
  ) THEN
    ALTER TABLE match_results ADD COLUMN player2_set2_score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_results' AND column_name = 'player2_set3_score'
  ) THEN
    ALTER TABLE match_results ADD COLUMN player2_set3_score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_results' AND column_name = 'location'
  ) THEN
    ALTER TABLE match_results ADD COLUMN location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_results' AND column_name = 'comments'
  ) THEN
    ALTER TABLE match_results ADD COLUMN comments text;
  END IF;
END $$;

-- Add columns to matches table for tracking result submission
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'result_submitted'
  ) THEN
    ALTER TABLE matches ADD COLUMN result_submitted boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'result_approved'
  ) THEN
    ALTER TABLE matches ADD COLUMN result_approved boolean DEFAULT false;
  END IF;
END $$;