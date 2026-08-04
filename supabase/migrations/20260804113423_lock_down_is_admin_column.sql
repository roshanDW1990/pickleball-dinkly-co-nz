/*
# Lock down is_admin column on profiles table

## Summary
Prevents any signed-in user from promoting themselves to admin by revoking
UPDATE privilege on the is_admin column for the anon and authenticated roles.

## Security Changes
- REVOKE UPDATE on profiles.is_admin from anon and authenticated roles.
- Replace the existing "Users can update own profile" policy with one that
  explicitly prevents changing is_admin (uses a WITH CHECK ensuring the
  value stays unchanged).

## Important Notes
1. The service_role (used by server-side functions and the Supabase dashboard)
   retains full privileges, so admins can still be assigned manually.
2. Regular users can still update all other profile fields (name, location, etc.).
3. This closes a privilege escalation vulnerability where any signed-in user
   could set is_admin = true on their own profile row.
*/

-- Revoke column-level UPDATE on is_admin for public-facing roles
REVOKE UPDATE (is_admin) ON public.profiles FROM anon, authenticated;

-- Replace the update policy to add a WITH CHECK that prevents changing is_admin
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.id = id));
