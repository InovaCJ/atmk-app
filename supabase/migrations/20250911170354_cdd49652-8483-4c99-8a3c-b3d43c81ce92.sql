-- Remove the conflicting and redundant RLS policy that denies all access to anonymous users
-- The existing authenticated-only policies already provide proper security
DROP POLICY IF EXISTS "Deny all access to anonymous users" ON public.profiles;

-- Verify the remaining policies are sufficient:
-- 1. "Authenticated users can view only their own profile" - SELECT with user_id check
-- 2. "Authenticated users can create only their own profile" - INSERT with user_id check  
-- 3. "Authenticated users can update only their own profile" - UPDATE with user_id check
-- 4. "Authenticated users can delete only their own profile" - DELETE with user_id check

-- These policies already ensure:
-- - Only authenticated users can access the table
-- - Users can only access their own profile data
-- - No anonymous access is possible
-- - Proper user isolation is maintained