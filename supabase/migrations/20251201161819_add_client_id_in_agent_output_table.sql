ALTER TABLE public.agent_output
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.agent_output
ALTER COLUMN user_id DROP NOT NULL;
