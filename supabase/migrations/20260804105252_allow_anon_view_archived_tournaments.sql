/*
# Allow public (anon) users to view archived tournaments

## Problem
The existing "Public can view active tournaments" policy restricts the anon role to only
see tournaments with status IN ('Approved', 'Ongoing') AND archived = false. This means
visitors who are not signed in cannot see any archived leagues on the archived standings page.

## Fix
Replace the policy with a broader one that allows anon users to view tournaments that are
either active (Approved/Ongoing) OR archived. Only truly hidden items (e.g. Pending status
tournaments that haven't been approved yet) remain invisible to the public.

## Security
- Pending tournaments remain hidden from unauthenticated users
- Authenticated users still have unrestricted SELECT via their own policy
*/

DROP POLICY IF EXISTS "Public can view active tournaments" ON tournaments;

CREATE POLICY "Public can view active tournaments"
ON tournaments FOR SELECT
TO anon
USING (
  status IN ('Approved', 'Ongoing')
  OR archived = true
);
