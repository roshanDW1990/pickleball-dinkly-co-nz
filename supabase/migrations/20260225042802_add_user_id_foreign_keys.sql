/*
  # Add Foreign Key Constraints for user_id columns

  1. Changes
    - Add foreign key constraint from group_members.user_id to profiles.id
    - Add foreign key constraint from tournament_registrations.user_id to profiles.id
  
  2. Security
    - No changes to RLS policies
    - These constraints ensure data integrity
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'group_members_user_id_fkey' 
    AND table_name = 'group_members'
  ) THEN
    ALTER TABLE group_members
    ADD CONSTRAINT group_members_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tournament_registrations_user_id_fkey' 
    AND table_name = 'tournament_registrations'
  ) THEN
    ALTER TABLE tournament_registrations
    ADD CONSTRAINT tournament_registrations_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
