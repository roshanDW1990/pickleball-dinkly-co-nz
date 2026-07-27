/*
  # Fix Group Members Infinite Recursion - Final Solution

  ## Problem
  The current RLS policy for "Users can view members in their groups" causes infinite recursion
  because it queries the same table (group_members) that it's protecting, creating a circular dependency.

  ## Solution
  Remove the problematic user policy entirely. Users don't need to view other group members through 
  the group_members table directly. They can view group information through:
  1. The tournament_groups table (which they can already see)
  2. Admin-controlled interfaces that use service role queries
  
  Only admins need direct access to the group_members table for management purposes.

  ## Changes
  1. Drop the recursive "Users can view members in their groups" policy
  2. Keep only admin policies for group_members table
  3. Users retain ability to view tournament_groups they belong to (separate table, no recursion)

  ## Security Impact
  - Admins retain full access to manage group members
  - Users can still see which groups they belong to via tournament_groups table
  - Removes infinite recursion error when creating groups
  - More restrictive but cleaner security model
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view members in their groups" ON group_members;

-- Verify admin policies exist (recreate if needed to ensure they're correct)
DROP POLICY IF EXISTS "Admins can view all group members" ON group_members;
CREATE POLICY "Admins can view all group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
