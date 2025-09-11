-- Fix RLS policies on profiles table to ensure complete security

-- First, let's drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Secure profile SELECT access" ON public.profiles;
DROP POLICY IF EXISTS "Secure profile INSERT access" ON public.profiles;
DROP POLICY IF EXISTS "Secure profile UPDATE access" ON public.profiles;
DROP POLICY IF EXISTS "Secure profile DELETE access" ON public.profiles;

-- Create more restrictive policies that explicitly block anonymous users
-- Users can only view their own profile
CREATE POLICY "Users can only view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can only insert their own profile
CREATE POLICY "Users can only insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can only update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own profile
CREATE POLICY "Users can only delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled (should already be enabled but making sure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add a policy to explicitly deny all access to anonymous users
CREATE POLICY "Deny anonymous access"
ON public.profiles FOR ALL
TO anon
USING (false)
WITH CHECK (false);