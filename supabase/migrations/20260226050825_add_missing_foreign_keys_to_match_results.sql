/*
  # Add missing foreign keys to match_results table

  ## Changes
  1. Add foreign key constraint for submitted_by column referencing profiles(id)
  2. Add foreign key constraint for winner_id column referencing profiles(id)
  3. Add foreign key constraint for reviewed_by column referencing profiles(id)

  ## Notes
  - These foreign keys are required for Supabase PostgREST to resolve nested relationships
  - The relationships enable queries like `submitter:submitted_by (first_name, last_name)`
*/

-- Add foreign key for submitted_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'match_results_submitted_by_fkey'
  ) THEN
    ALTER TABLE match_results 
    ADD CONSTRAINT match_results_submitted_by_fkey 
    FOREIGN KEY (submitted_by) REFERENCES profiles(id);
  END IF;
END $$;

-- Add foreign key for winner_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'match_results_winner_id_fkey'
  ) THEN
    ALTER TABLE match_results 
    ADD CONSTRAINT match_results_winner_id_fkey 
    FOREIGN KEY (winner_id) REFERENCES profiles(id);
  END IF;
END $$;

-- Add foreign key for reviewed_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'match_results_reviewed_by_fkey'
  ) THEN
    ALTER TABLE match_results 
    ADD CONSTRAINT match_results_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES profiles(id);
  END IF;
END $$;
