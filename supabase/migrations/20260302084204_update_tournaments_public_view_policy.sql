/*
  # Update tournaments public view policy

  1. Security Changes
    - Drop the old "Public can view approved tournaments" policy
    - Create a new policy that allows public users to view tournaments with status 'Approved' OR 'Ongoing'
    - Maintains archived = false filter to hide archived tournaments from public view
*/

DROP POLICY IF EXISTS "Public can view approved tournaments" ON tournaments;

CREATE POLICY "Public can view active tournaments"
  ON tournaments
  FOR SELECT
  TO anon
  USING ((status IN ('Approved', 'Ongoing')) AND (archived = false));
