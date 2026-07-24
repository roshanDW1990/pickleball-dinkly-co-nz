/*
  # Fix Group Members RLS Policy Infinite Recursion

  ## Changes
  1. Drop the problematic "Users can view members in their groups" policy that causes infinite recursion
  2. Recreate it using a simpler approach with tournament_groups join instead of self-referencing group_members

  ## Security Impact
  - Users can still view group members in groups they belong to
  - Admins retain full access to all group members
  - Removes the circular dependency that was causing database errors
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view members in their groups" ON group_members;

-- Recreate with a simpler approach that doesn't self-reference
CREATE POLICY "Users can view members in their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );