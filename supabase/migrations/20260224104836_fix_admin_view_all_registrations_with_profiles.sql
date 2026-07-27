/*
  # Fix Admin Access to View Registrations with Profile Data

  ## Changes
  This migration ensures that when admins query tournament_registrations with nested profile data,
  the query doesn't fail due to RLS restrictions. The existing admin policy allows viewing registrations,
  but we need to ensure the nested profile lookup works correctly.

  ## Security
  - No changes to existing security model
  - This is a clarification/fix to ensure admin queries work as intended
*/

-- The issue is that the Supabase client uses a foreign key relationship to fetch profiles
-- The existing policies should work, but we need to verify the profiles table has proper admin access

-- Check if there's already an admin view policy for profiles, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
      ON profiles FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
          AND p.is_admin = true
        )
      );
  END IF;
END $$;
