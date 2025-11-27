-- Table: agent_output
CREATE TABLE public.agent_output (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  model VARCHAR(255) NOT NULL,
  instruction TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  usage JSONB,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_agent_output_user_id
  ON public.agent_output(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_agent_output_updated_at
  BEFORE UPDATE ON public.agent_output
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.agent_output ENABLE ROW LEVEL SECURITY;


-- RLS Policies
DROP POLICY IF EXISTS "Users can access their own agent output" ON public.agent_output;

-- SELECT, UPDATE, DELETE for owner only
CREATE POLICY "Users can access their own agent output"
  ON public.agent_output
  USING (user_id = auth.uid());

-- INSERT must match auth.uid()
CREATE POLICY "Users can insert their own agent output"
  ON public.agent_output
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can insert any record in agent_output"
  ON public.agent_output
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_output TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_output TO service_role;
