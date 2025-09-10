-- Reforçar as políticas RLS da tabela profiles com proteções adicionais contra vulnerabilidades

-- Remover políticas existentes para recriar com proteções máximas
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;  
DROP POLICY IF EXISTS "Users can delete own profile only" ON public.profiles;

-- Criar políticas com proteções máximas contra bypass e vulnerabilidades de aplicação

-- 1. SELECT: Proteção restritiva com múltiplas validações
CREATE POLICY "Restrict profile access to owner only"
ON public.profiles
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND user_id = auth.uid() -- Dupla verificação para evitar bypass
);

-- 2. INSERT: Proteção contra criação de perfis de outros usuários
CREATE POLICY "Allow profile creation for authenticated user only"
ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND user_id = auth.uid() -- Garantir que user_id corresponde exatamente ao auth.uid()
);

-- 3. UPDATE: Proteção máxima contra modificação de perfis alheios
CREATE POLICY "Restrict profile updates to owner only"
ON public.profiles
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND user_id = auth.uid()
  AND NEW.user_id = auth.uid() -- Impedir alteração do user_id
);

-- 4. DELETE: Proteção contra exclusão de perfis alheios  
CREATE POLICY "Restrict profile deletion to owner only"
ON public.profiles
FOR DELETE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND user_id = auth.uid()
);

-- 5. Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Adicionar constraint adicional para garantir integridade
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_user_id_not_null_check 
  CHECK (user_id IS NOT NULL);

-- 7. Criar função de segurança definer para validação adicional
CREATE OR REPLACE FUNCTION public.validate_profile_access(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND auth.uid() = target_user_id;
$$;

-- 8. Revogar todas as permissões desnecessárias na tabela
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Comentários de segurança
COMMENT ON TABLE public.profiles IS 'User profiles table with maximum RLS protection. Only profile owners can access their own data.';
COMMENT ON COLUMN public.profiles.user_id IS 'User ID that must match auth.uid() for all operations. Never null.';