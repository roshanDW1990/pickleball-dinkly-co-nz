/*
  # Add public view access to tournament groups

  1. Security Changes
    - Add policy to allow public (anon) users to view all tournament groups
    - This enables the public standings page to display group standings
    - Public users can only SELECT, not modify groups
*/

CREATE POLICY "Public can view tournament groups"
  ON tournament_groups
  FOR SELECT
  TO anon
  USING (true);
