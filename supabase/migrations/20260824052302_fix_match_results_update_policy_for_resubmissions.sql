/*
# Fix match_results update policy for resubmissions

## Problem
When a player resubmits a rejected result, the RLS policy "Users can update their
pending submissions" blocks the UPDATE because it only allows changes when
status = 'pending'. A rejected row has status = 'rejected', so the player's
resubmission silently fails and the admin never sees it in the Pending tab.

## Changes
- Drop the old policy that only allowed updates on pending rows.
- Create a new policy that allows the submitter to update rows with status
  'pending' OR 'rejected', so resubmissions work correctly.

## Security
- Still restricted to the original submitter (submitted_by = auth.uid()).
- Only pending or rejected rows can be modified — approved results remain locked.
*/

DROP POLICY IF EXISTS "Users can update their pending submissions" ON match_results;

CREATE POLICY "Users can update their pending or rejected submissions"
ON match_results FOR UPDATE
TO authenticated
USING (submitted_by = auth.uid() AND status IN ('pending', 'rejected'))
WITH CHECK (submitted_by = auth.uid() AND status = 'pending');
