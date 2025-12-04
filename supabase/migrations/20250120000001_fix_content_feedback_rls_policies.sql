-- Migration: Fix RLS policies for content_feedback table
-- Description: Updates the INSERT and SELECT policies to use helper functions and allow proper access

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view feedback from their clients" ON public.content_feedback;
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.content_feedback;

-- Recreate SELECT policy using helper functions
CREATE POLICY "Users can view feedback from their clients"
ON public.content_feedback
FOR SELECT
USING (
  -- User can see their own feedback
  auth.uid() = user_id
  OR
  -- User is a member of the client that owns the content (using helper function)
  client_id IN (SELECT get_member_client_ids())
  OR
  -- User owns the client
  client_id IN (SELECT get_owned_clients())
);

-- Recreate INSERT policy with better logic
CREATE POLICY "Users can insert their own feedback"
ON public.content_feedback
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- Allow if client_id is NULL (content without client)
    client_id IS NULL
    OR
    -- User is a member of the client (using helper function to avoid RLS recursion)
    client_id IN (SELECT get_member_client_ids())
    OR
    -- User owns the client
    client_id IN (SELECT get_owned_clients())
    OR
    -- Or verify through the generated_content that user has access
    EXISTS (
      SELECT 1
      FROM public.generated_content gc
      WHERE gc.id = generated_content_id
      AND (
        gc.client_id IS NULL
        OR gc.client_id IN (SELECT get_member_client_ids())
        OR gc.client_id IN (SELECT get_owned_clients())
      )
    )
  )
);

-- Ensure helper functions have grants (idempotent)
GRANT EXECUTE ON FUNCTION public.get_owned_clients TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_member_client_ids TO authenticated, service_role;

