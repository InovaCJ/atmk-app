ALTER TABLE public.agents
ADD COLUMN tools jsonb DEFAULT '[]'::jsonb;
