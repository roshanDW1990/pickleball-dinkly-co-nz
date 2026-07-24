/*
  # Fix Matches Foreign Key Relationships for PostgREST

  This migration adds proper foreign key relationships to the matches table
  so that PostgREST can correctly join with the profiles table.

  ## Changes
  1. Add foreign key constraints from matches.player1_id and matches.player2_id to profiles table
  2. This enables PostgREST to recognize the relationships and perform joins

  ## Important Notes
  - The foreign keys reference the profiles table (not auth.users) since profiles contains the user data
  - This allows queries like `player1:player1_id(profiles!inner(*))` to work properly
*/

-- Add foreign key constraints to profiles table for player relationships
-- Note: We use IF NOT EXISTS pattern to avoid errors if constraints already exist

DO $$
BEGIN
  -- Check if player1_id constraint to profiles exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'matches_player1_id_profiles_fkey'
    AND table_name = 'matches'
  ) THEN
    -- Add foreign key constraint for player1_id to profiles
    ALTER TABLE matches
    ADD CONSTRAINT matches_player1_id_profiles_fkey
    FOREIGN KEY (player1_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Check if player2_id constraint to profiles exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'matches_player2_id_profiles_fkey'
    AND table_name = 'matches'
  ) THEN
    -- Add foreign key constraint for player2_id to profiles
    ALTER TABLE matches
    ADD CONSTRAINT matches_player2_id_profiles_fkey
    FOREIGN KEY (player2_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
