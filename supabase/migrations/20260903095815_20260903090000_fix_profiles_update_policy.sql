/*
# Fix Broken UPDATE Policy on Profiles Table

## Problem
The existing "Users can update own profile" UPDATE policy has a broken WITH CHECK clause:
  `(auth.uid() = id) AND (is_admin = (SELECT p.is_admin FROM profiles p WHERE (p.id = p.id)))`

The subquery `WHERE p.id = p.id` matches EVERY row in the profiles table (not just the
user's own row), returning multiple rows. PostgreSQL cannot compare a single scalar
value against a multi-row subquery result, so it throws an error on every UPDATE attempt.
This blocks all profile updates, including DUPR rating changes.

## Fix
Replace the broken policy with a simple ownership check: `auth.uid() = id`.

The is_admin column is already protected at the column privilege level — UPDATE was
revoked on that specific column in a prior migration (20260804113423_lock_down_is_admin_column.sql).
The broken subquery was an attempt to add a second layer of protection, but it is
unnecessary and causes the error. The column-level privilege is the correct and
sufficient guard.

## Changes
1. Drop the existing broken "Users can update own profile" policy.
2. Create a new "Users can update own profile" policy with `auth.uid() = id` for both
   USING and WITH CHECK.

## Security
- Users can only update their own profile row (ownership check via auth.uid() = id).
- The is_admin column remains protected by column-level privilege revocation.
- No other policies or permissions are changed.
*/

-- Drop the broken policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with a simple, correct ownership check
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
