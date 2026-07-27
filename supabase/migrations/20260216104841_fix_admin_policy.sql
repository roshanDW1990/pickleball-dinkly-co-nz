/*
  # Fix Admin Policy Issue

  1. Changes
    - Drop the problematic "Admins can read all profiles with admin status" policy
    - This policy was causing recursive query issues
    - Existing policies already allow users to read their own profile (including is_admin field)
    - Existing policies already allow authenticated users to read public profiles
  
  2. Security
    - Users can still read their own is_admin status
    - Users can read other profiles but the existing policy doesn't expose is_admin to non-admins
*/

DROP POLICY IF EXISTS "Admins can read all profiles with admin status" ON profiles;