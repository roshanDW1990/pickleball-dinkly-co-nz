/*
  # Update tournaments table schema

  1. Changes
    - Make removed fields nullable with defaults (organizer, max_participants, current_participants, prize_pool, surface, skill_level)
    - Update status field to use 'Pending' as default
    - Add archived boolean field for tracking archived approved tournaments
    
  2. Security Updates
    - Update RLS policy so public can only view approved tournaments
    - Keep admin (authenticated) access to all tournaments
*/

-- Make removed fields nullable and set defaults
DO $$
BEGIN
  -- Update organizer to be nullable with empty default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'organizer' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tournaments ALTER COLUMN organizer DROP NOT NULL;
    ALTER TABLE tournaments ALTER COLUMN organizer SET DEFAULT '';
  END IF;

  -- Update max_participants to be nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'max_participants' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tournaments ALTER COLUMN max_participants DROP NOT NULL;
  END IF;

  -- Update current_participants to be nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'current_participants' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tournaments ALTER COLUMN current_participants DROP NOT NULL;
  END IF;

  -- Update prize_pool to be nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'prize_pool' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tournaments ALTER COLUMN prize_pool DROP NOT NULL;
  END IF;

  -- Update surface to be nullable with empty default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'surface' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tournaments ALTER COLUMN surface DROP NOT NULL;
    ALTER TABLE tournaments ALTER COLUMN surface SET DEFAULT '';
  END IF;

  -- Update skill_level to be nullable with empty default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'skill_level' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tournaments ALTER COLUMN skill_level DROP NOT NULL;
    ALTER TABLE tournaments ALTER COLUMN skill_level SET DEFAULT '';
  END IF;

  -- Update status default to 'Pending'
  ALTER TABLE tournaments ALTER COLUMN status SET DEFAULT 'Pending';
END $$;

-- Add archived column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournaments' AND column_name = 'archived'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN archived boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Drop the old public view policy
DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;

-- Create new policy: public can only view approved, non-archived tournaments
CREATE POLICY "Public can view approved tournaments"
  ON tournaments
  FOR SELECT
  TO anon
  USING (status = 'Approved' AND archived = false);

-- Create policy: authenticated users can view all tournaments
CREATE POLICY "Authenticated users can view all tournaments"
  ON tournaments
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for archived field
CREATE INDEX IF NOT EXISTS tournaments_archived_idx ON tournaments(archived);