-- 1) Drop the content column (if it exists)
ALTER TABLE public.generated_content
DROP COLUMN IF EXISTS content;


-- 2) Create messages table
CREATE TABLE IF NOT EXISTS public.generated_content_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FK: each message belongs to a generated_content "conversation"
  generated_content_id UUID NOT NULL
    REFERENCES public.generated_content(id)
    ON DELETE CASCADE,

  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 3) Helpful index for chat retrieval performance
CREATE INDEX IF NOT EXISTS generated_content_messages_gc_id_idx
  ON public.generated_content_messages (generated_content_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_content_messages TO service_role;