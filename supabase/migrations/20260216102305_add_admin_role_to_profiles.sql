/*
  # Add Admin Role to Profiles

  1. Changes
    - Add `is_admin` boolean column to profiles table
    - Default to false for security
    - Add policy for admins to read all profiles
  
  2. Security
    - Only admins can see who else is an admin
    - Regular users cannot see admin status of others
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Drop existing policy if it exists and recreate
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can read all profiles with admin status" ON profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policy: Admins can read all profile data including admin status
CREATE POLICY "Admins can read all profiles with admin status"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );