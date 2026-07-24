/*
  # Allow authenticated users to view all group members and matches for standings

  ## Problem
  The League Standings page fetches group members and matches to calculate the points
  table. However, authenticated (logged-in) non-admin users can only see:
  - group_members: only rows where they are an admin (missing regular user SELECT policy)
  - matches: only their own matches

  This means the standings table shows zero data or incomplete data for logged-in users,
  even though the anon role has unrestricted SELECT on both tables.

  ## Fix
  Add SELECT policies for the `authenticated` role to allow all logged-in users to view:
  1. All group members (needed to enumerate players in each group)
  2. All matches (needed to look up results for each player in a group)

  These are read-only policies and do not grant any write access.
*/

CREATE POLICY "Authenticated users can view all group members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view all matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (true);
