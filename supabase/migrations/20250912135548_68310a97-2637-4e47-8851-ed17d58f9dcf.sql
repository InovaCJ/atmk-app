-- Fix critical security vulnerability in profiles table
-- Ensure RLS is properly enforced for all roles

-- First, let's ensure RLS is forced even for table owners
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Deny access to anonymous users" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can delete only their own profile" ON public.profiles;

-- Create restrictive policies that explicitly block unauthorized access
-- Block all access for anonymous users
CREATE POLICY "Block anonymous users completely" ON public.profiles
FOR ALL TO anon
USING (false)
WITH CHECK (false);

-- Block all access for public role
CREATE POLICY "Block public role completely" ON public.profiles
FOR ALL TO public
USING (false)
WITH CHECK (false);

-- Allow authenticated users to view only their own profile
CREATE POLICY "Authenticated users can view only their own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow authenticated users to create only their own profile
CREATE POLICY "Authenticated users can create only their own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow authenticated users to update only their own profile
CREATE POLICY "Authenticated users can update only their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow authenticated users to delete only their own profile
CREATE POLICY "Authenticated users can delete only their own profile" ON public.profiles
FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Revoke any existing table-level permissions that might bypass RLS
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;