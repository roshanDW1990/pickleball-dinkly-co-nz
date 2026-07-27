/*
  # Add Admin Policy for Tournament Registrations

  1. Changes
    - Add SELECT policy for admins to view all tournament registrations
    
  2. Security
    - Only users with is_admin = true in their profile can view all registrations
    - Regular users can still only view their own registrations
*/

CREATE POLICY "Admins can view all registrations"
  ON tournament_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
