-- Complete security fix for profiles table and ai_generations table

-- Profiles table: Ensure bulletproof security
-- Drop existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access" ON public.profiles;

-- Create comprehensive security policies for profiles
-- Completely deny all access to anonymous users (default deny)
CREATE POLICY "Deny all access to anonymous users"
ON public.profiles FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Allow authenticated users to select only their own profile
CREATE POLICY "Authenticated users can view only their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow authenticated users to insert only their own profile
CREATE POLICY "Authenticated users can create only their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow authenticated users to update only their own profile
CREATE POLICY "Authenticated users can update only their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow authenticated users to delete only their own profile
CREATE POLICY "Authenticated users can delete only their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix ai_generations table missing UPDATE/DELETE policies
-- Add missing UPDATE policy for ai_generations
CREATE POLICY "Users can update their own AI generations"
ON public.ai_generations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND company_id IN (
    SELECT companies.id 
    FROM companies 
    WHERE companies.owner_id = auth.uid()
))
WITH CHECK (auth.uid() = user_id AND company_id IN (
    SELECT companies.id 
    FROM companies 
    WHERE companies.owner_id = auth.uid()
));

-- Add missing DELETE policy for ai_generations  
CREATE POLICY "Users can delete their own AI generations"
ON public.ai_generations FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND company_id IN (
    SELECT companies.id 
    FROM companies 
    WHERE companies.owner_id = auth.uid()
));