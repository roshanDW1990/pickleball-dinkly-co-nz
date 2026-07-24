/*
  # Fix match_results foreign keys to reference profiles instead of auth.users

  ## Changes
  1. Drop existing foreign keys that reference auth.users
  2. Add new foreign keys that reference profiles table
  
  ## Reasoning
  - Supabase PostgREST can more easily resolve relationships when using the profiles table
  - This matches the pattern used in other tables (group_members, tournament_registrations)
  - Allows for cleaner nested queries like `submitter:submitted_by (first_name, last_name)`
*/

-- Drop existing foreign keys
ALTER TABLE match_results DROP CONSTRAINT IF EXISTS match_results_submitted_by_fkey;
ALTER TABLE match_results DROP CONSTRAINT IF EXISTS match_results_winner_id_fkey;
ALTER TABLE match_results DROP CONSTRAINT IF EXISTS match_results_reviewed_by_fkey;

-- Add new foreign keys pointing to profiles
ALTER TABLE match_results 
ADD CONSTRAINT match_results_submitted_by_fkey 
FOREIGN KEY (submitted_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE match_results 
ADD CONSTRAINT match_results_winner_id_fkey 
FOREIGN KEY (winner_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE match_results 
ADD CONSTRAINT match_results_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
