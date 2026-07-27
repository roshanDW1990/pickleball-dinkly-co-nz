/*
  # Fix profiles table for pickleball (rename tennis columns)

  1. Changes
    - Rename `tennis_level` column to `pickleball_level`
    - Rename `world_tennis_number` column to `dupr_rating`
  
  2. Notes
    - This aligns the database schema with the application code
    - Existing data will be preserved during the rename
*/

-- Rename tennis_level to pickleball_level
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tennis_level'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN tennis_level TO pickleball_level;
  END IF;
END $$;

-- Rename world_tennis_number to dupr_rating
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'world_tennis_number'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN world_tennis_number TO dupr_rating;
  END IF;
END $$;