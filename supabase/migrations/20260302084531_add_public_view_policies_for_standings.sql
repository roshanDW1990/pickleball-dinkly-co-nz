/*
  # Add public view access for standings data

  1. Security Changes
    - Add policies to allow public (anon) users to view group members
    - Add policies to allow public (anon) users to view matches
    - Add policies to allow public (anon) users to view match results
    - Add policies to allow public (anon) users to view player profiles
    - This enables the public standings page to display full standings with player names and match results
    - Public users can only SELECT, not modify any data
*/

-- Allow public to view group members
CREATE POLICY "Public can view group members"
  ON group_members
  FOR SELECT
  TO anon
  USING (true);

-- Allow public to view matches
CREATE POLICY "Public can view matches"
  ON matches
  FOR SELECT
  TO anon
  USING (true);

-- Allow public to view match results
CREATE POLICY "Public can view match results"
  ON match_results
  FOR SELECT
  TO anon
  USING (true);

-- Allow public to view profiles (names only, for standings display)
CREATE POLICY "Public can view profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (true);
