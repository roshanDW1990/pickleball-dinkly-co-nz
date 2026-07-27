/*
  # Remove Circular Admin Profiles Policy

  ## Issue
  The "Admins can view all profiles" policy created a circular dependency:
  - To check if a user is an admin, we query the profiles table
  - But to query the profiles table, we need to check if the user is an admin
  - This creates infinite recursion

  ## Solution
  Remove the problematic policy. The existing "Authenticated users can read public profiles" 
  policy already allows all authenticated users (including admins) to read all profiles.

  ## Security
  - Maintains existing security model
  - All authenticated users can already view public profile information
  - This is necessary for features like viewing tournament registrations with user details
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
