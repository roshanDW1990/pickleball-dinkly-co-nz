/*
  # Allow authenticated users to view all tournament groups

  ## Problem
  The existing "Public can view tournament groups" policy only applies to the `anon` role.
  When an authenticated (logged-in) user views the League Standings page, they can only
  see tournament groups they are personally a member of (via the existing "Users can view
  their tournament groups" policy). This means:
  - A user not in any group sees zero groups → "No Standings Available" message
  - A user in only one group sees only that group, not all groups in the league

  ## Fix
  Add a SELECT policy for the `authenticated` role that allows viewing all tournament groups.
  This mirrors the anon policy but for logged-in users, enabling the standings page to
  show complete group tables for all players in the league.
*/

CREATE POLICY "Authenticated users can view all tournament groups"
  ON tournament_groups
  FOR SELECT
  TO authenticated
  USING (true);
