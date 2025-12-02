-- ================================
-- DIFF: Changes from OLD ➜ NEW
-- ================================

-- 1. Add new columns (content_type, status, generation_params)
ALTER TABLE public.generated_content
    ADD COLUMN IF NOT EXISTS source_category TEXT,
    ADD COLUMN IF NOT EXISTS source_content TEXT,
    ADD COLUMN IF NOT EXISTS context TEXT,
    ADD COLUMN IF NOT EXISTS objective TEXT,
    ADD COLUMN IF NOT EXISTS use_knowledge_base BOOLEAN DEFAULT false;

-- 2. Modify user_id to allow NULL + change delete behavior
ALTER TABLE public.generated_content
    DROP CONSTRAINT IF EXISTS generated_content_user_id_fkey;

ALTER TABLE public.generated_content
    ALTER COLUMN user_id DROP NOT NULL,
    ADD CONSTRAINT generated_content_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Remove old RLS policies
DROP POLICY IF EXISTS "Users can access their own generated content" ON public.generated_content;
DROP POLICY IF EXISTS "Users can insert their own generated content" ON public.generated_content;
DROP POLICY IF EXISTS "Service role can insert any record in generated_content" ON public.generated_content;
DROP POLICY IF EXISTS "Users can manage their own generated content" ON public.generated_content;
-- 4. Remove old GRANTs (no longer relevant)
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.generated_content FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.generated_content FROM service_role;

-- 5. Ensure RLS is enabled
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- 6. Create new company-based RLS policies

CREATE POLICY "Users can manage their own generated content"
ON public.generated_content
FOR select
USING (
    auth.uid() = generated_content.user_id -- criador da automation
    OR
    generated_content.user_id IN (         -- membro do client
      select client_id
      from public.client_members
      where user_id = auth.uid()
    )
);

GRANT SELECT ON public.generated_content TO authenticated;
GRANT ALL ON public.generated_content TO service_role;