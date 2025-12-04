-- Migration: Create content_feedback table for storing user feedback on generated content
-- Description: Stores detailed feedback from users about generated content, including ratings and contextual information

CREATE TABLE IF NOT EXISTS public.content_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User who provided the feedback
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content being evaluated
  generated_content_id UUID NOT NULL REFERENCES public.generated_content(id) ON DELETE CASCADE,
  
  -- Optional: specific message ID from the chat (if feedback is for a specific message)
  message_id UUID,
  
  -- Client context (copied from generated_content for easier querying)
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- News item context (if content was generated from a news item)
  news_item_id UUID REFERENCES public.news_items(id) ON DELETE SET NULL,
  
  -- Content metadata (copied for analysis purposes)
  objective TEXT,
  content_type TEXT,
  
  -- Feedback responses
  helps_objective TEXT NOT NULL CHECK (helps_objective IN ('yes', 'partial', 'no')),
  is_clear_and_ready TEXT NOT NULL CHECK (is_clear_and_ready IN ('yes', 'partial', 'no')),
  usefulness INTEGER NOT NULL CHECK (usefulness >= 1 AND usefulness <= 5),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_feedback_user_id ON public.content_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_generated_content_id ON public.content_feedback(generated_content_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_client_id ON public.content_feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_news_item_id ON public.content_feedback(news_item_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_created_at ON public.content_feedback(created_at DESC);

-- Composite index for common queries (client + date range)
CREATE INDEX IF NOT EXISTS idx_content_feedback_client_created ON public.content_feedback(client_id, created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_content_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_feedback_updated_at
  BEFORE UPDATE ON public.content_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_content_feedback_updated_at();

-- Enable RLS
ALTER TABLE public.content_feedback ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_feedback TO authenticated;
GRANT ALL ON public.content_feedback TO service_role;

-- Grant execute on helper functions (if not already granted)
GRANT EXECUTE ON FUNCTION public.get_owned_clients TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_member_client_ids TO authenticated, service_role;

-- RLS Policies
-- Users can view feedback from their clients
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

-- Users can insert their own feedback
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

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback"
ON public.content_feedback
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback"
ON public.content_feedback
FOR DELETE
USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE public.content_feedback IS 'Stores user feedback on generated content for analysis and improvement';
COMMENT ON COLUMN public.content_feedback.helps_objective IS 'Whether the content helps achieve the defined objective: yes, partial, no';
COMMENT ON COLUMN public.content_feedback.is_clear_and_ready IS 'Whether the content is clear, contextualized and ready to use: yes, partial, no';
COMMENT ON COLUMN public.content_feedback.usefulness IS 'Rating from 1 to 5 on how useful the content is (4-5 = useful/very useful)';
COMMENT ON COLUMN public.content_feedback.message_id IS 'Optional: ID of the specific chat message being evaluated';
COMMENT ON COLUMN public.content_feedback.news_item_id IS 'Optional: ID of the news item that originated the content';
