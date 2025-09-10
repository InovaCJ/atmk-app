-- Strengthen profiles RLS policies to eliminate any potential security vulnerabilities

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;  
DROP POLICY IF EXISTS "Users can delete own profile only" ON public.profiles;

-- Create ultra-secure RESTRICTIVE policies with comprehensive null checks
CREATE POLICY "Secure profile SELECT access"
ON public.profiles
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL 
  AND auth.uid() = user_id
);

CREATE POLICY "Secure profile INSERT access"
ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL 
  AND auth.uid() = user_id
);

CREATE POLICY "Secure profile UPDATE access"
ON public.profiles
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL 
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL 
  AND auth.uid() = user_id
  AND user_id = auth.uid()
);

CREATE POLICY "Secure profile DELETE access"
ON public.profiles
FOR DELETE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL 
  AND auth.uid() = user_id
);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add constraint to prevent null user_id values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_not_null 
CHECK (user_id IS NOT NULL);

-- Revoke unnecessary permissions
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;