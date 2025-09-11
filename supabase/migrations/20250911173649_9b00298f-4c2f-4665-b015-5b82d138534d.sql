-- Add explicit policy to deny anonymous access to profiles table
-- This provides defense in depth by explicitly denying access to unauthenticated users

CREATE POLICY "Deny access to anonymous users" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false);