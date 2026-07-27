/*
  # Allow authenticated users to view all approved match results

  ## Problem
  The existing "Public can view match results" policy only applies to the `anon` role.
  When an authenticated user views the standings page, they are restricted to only
  seeing match results for matches they personally participated in. This means other
  players' scores return empty, causing incorrect (zero) points to be displayed.

  ## Fix
  Add a SELECT policy for the `authenticated` role that allows viewing all match results
  where the result has been approved. This mirrors the anon policy but scoped to
  authenticated users, enabling the standings page to calculate points correctly for all
  players regardless of who is viewing.
*/

CREATE POLICY "Authenticated users can view all approved match results"
  ON match_results
  FOR SELECT
  TO authenticated
  USING (status = 'approved');
