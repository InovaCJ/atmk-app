-- Corrigir as políticas RLS da tabela profiles com sintaxe PostgreSQL correta

-- Remover políticas existentes para recriar com proteções máximas
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;  
DROP POLICY IF EXISTS "Users can delete own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Restrict profile access to owner only" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation for authenticated user only" ON public.profiles;
DROP POLICY IF EXISTS "Restrict profile updates to owner only" ON public.profiles;
DROP POLICY IF EXISTS "Restrict profile deletion to owner only" ON public.profiles;

-- Criar políticas com proteções máximas contra bypass e vulnerabilidades de aplicação

-- 1. SELECT: Proteção restritiva com múltiplas validações
CREATE POLICY "Maximum security profile access"
ON public.profiles
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
);

-- 2. INSERT: Proteção contra criação de perfis de outros usuários
CREATE POLICY "Maximum security profile creation"
ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
);

-- 3. UPDATE: Proteção máxima contra modificação de perfis alheios (sintaxe corrigida)
CREATE POLICY "Maximum security profile updates"
ON public.profiles
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
  AND new.user_id = auth.uid() -- Sintaxe correta: 'new' em minúsculo
);

-- 4. DELETE: Proteção contra exclusão de perfis alheios  
CREATE POLICY "Maximum security profile deletion"
ON public.profiles
FOR DELETE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND user_id IS NOT NULL
);

-- 5. Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Revogar todas as permissões desnecessárias na tabela
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Comentários de segurança
COMMENT ON TABLE public.profiles IS 'User profiles table with MAXIMUM RLS protection. Strict user isolation enforced.';
COMMENT ON COLUMN public.profiles.user_id IS 'User ID that must match auth.uid() for all operations. Triple-verified for security.';