-- Melhorar as políticas RLS da tabela profiles para máxima segurança

-- Primeiro, vamos remover as políticas existentes para recriar com mais segurança
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Política SELECT: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Política INSERT: Usuários podem criar apenas seu próprio perfil
CREATE POLICY "Users can create own profile only" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política UPDATE: Usuários podem atualizar apenas seu próprio perfil
-- Inclui verificação adicional para garantir que não podem alterar o user_id
CREATE POLICY "Users can update own profile only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND auth.uid() = user_id);

-- Política DELETE: Permitir que usuários possam deletar seu próprio perfil se necessário
-- (isso é uma decisão de negócio - pode ser removida se não for desejada)
CREATE POLICY "Users can delete own profile only" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Garantir que RLS está habilitado na tabela
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar índice para melhor performance nas consultas de RLS
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Adicionar constraint para garantir que user_id não seja nulo (segurança extra)
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;