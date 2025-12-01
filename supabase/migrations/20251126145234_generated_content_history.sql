-- Table: generated_content
CREATE TABLE public.generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on user_id for performance
CREATE INDEX IF NOT EXISTS generated_content_user_id
  ON public.generated_content(user_id);

-- Trigger for updated_at
CREATE TRIGGER generated_content_updated_at
  BEFORE UPDATE ON public.generated_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;


-- RLS Policies
DROP POLICY IF EXISTS "Users can access their own generated content" ON public.generated_content;

-- SELECT, UPDATE, DELETE for owner only
CREATE POLICY "Users can access their own generated content"
  ON public.generated_content
  USING (user_id = auth.uid());

-- INSERT must match auth.uid()
CREATE POLICY "Users can insert their own generated content"
  ON public.generated_content
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can insert any record in generated_content"
  ON public.generated_content
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_content TO service_role;
