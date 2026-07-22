/*
  # Add date_completed column to match_results

  ## Changes
  1. Add date_completed column to store when the match was actually played
  2. Defaults to current date when result is submitted
  
  ## Notes
  - This allows users to specify when the match actually occurred
  - Useful for tracking historical results or delayed submissions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_results' AND column_name = 'date_completed'
  ) THEN
    ALTER TABLE match_results 
    ADD COLUMN date_completed date DEFAULT CURRENT_DATE;
  END IF;
END $$;
