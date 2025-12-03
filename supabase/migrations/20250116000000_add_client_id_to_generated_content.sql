-- Adicionar client_id à tabela generated_content para isolamento por cliente
ALTER TABLE public.generated_content
    ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Criar índice para melhor performance nas consultas por cliente
CREATE INDEX IF NOT EXISTS generated_content_client_id_idx
    ON public.generated_content(client_id);

-- Atualizar RLS policies para incluir filtro por client_id
DROP POLICY IF EXISTS "Users can manage their own generated content" ON public.generated_content;

-- Nova política: usuários podem ver conteúdos do cliente se forem membros
CREATE POLICY "Users can view generated content from their clients"
ON public.generated_content
FOR SELECT
USING (
    -- Conteúdo criado pelo próprio usuário
    auth.uid() = generated_content.user_id
    OR
    -- Usuário é membro do cliente que possui o conteúdo
    generated_content.client_id IN (
        SELECT client_id
        FROM public.client_members
        WHERE user_id = auth.uid()
    )
);

-- Política para INSERT: usuário deve ser membro do cliente
CREATE POLICY "Users can insert generated content for their clients"
ON public.generated_content
FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND (
        client_id IS NULL
        OR
        client_id IN (
            SELECT client_id
            FROM public.client_members
            WHERE user_id = auth.uid()
        )
    )
);

-- Política para UPDATE: usuário deve ser membro do cliente
CREATE POLICY "Users can update generated content from their clients"
ON public.generated_content
FOR UPDATE
USING (
    auth.uid() = user_id
    OR
    client_id IN (
        SELECT client_id
        FROM public.client_members
        WHERE user_id = auth.uid()
        AND role IN ('client_admin', 'editor')
    )
)
WITH CHECK (
    auth.uid() = user_id
    OR
    client_id IN (
        SELECT client_id
        FROM public.client_members
        WHERE user_id = auth.uid()
        AND role IN ('client_admin', 'editor')
    )
);

-- Política para DELETE: usuário deve ser membro do cliente com permissão
CREATE POLICY "Users can delete generated content from their clients"
ON public.generated_content
FOR DELETE
USING (
    auth.uid() = user_id
    OR
    client_id IN (
        SELECT client_id
        FROM public.client_members
        WHERE user_id = auth.uid()
        AND role IN ('client_admin', 'editor')
    )
);

-- Garantir que service_role tenha acesso total
GRANT ALL ON public.generated_content TO service_role;

