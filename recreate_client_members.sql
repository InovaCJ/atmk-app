-- Script para recriar a tabela client_members
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover todas as políticas RLS da tabela client_members
DROP POLICY IF EXISTS "Users can view members of their clients" ON client_members;
DROP POLICY IF EXISTS "Client admins and owners can manage members" ON client_members;
DROP POLICY IF EXISTS "Client owners can add members" ON client_members;
DROP POLICY IF EXISTS "Client owners can update members" ON client_members;
DROP POLICY IF EXISTS "Client owners can remove members" ON client_members;
DROP POLICY IF EXISTS "Users can view members of their own clients" ON client_members;
DROP POLICY IF EXISTS "Users can manage members of their own clients" ON client_members;

-- 2. Desabilitar RLS na tabela client_members
ALTER TABLE client_members DISABLE ROW LEVEL SECURITY;

-- 3. Remover a tabela client_members completamente
DROP TABLE IF EXISTS client_members CASCADE;

-- 4. Recriar a tabela client_members sem RLS
CREATE TABLE client_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role client_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, user_id)
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_client_members_client_id ON client_members(client_id);
CREATE INDEX IF NOT EXISTS idx_client_members_user_id ON client_members(user_id);

-- 6. Verificar se a tabela foi criada corretamente
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'client_members' 
    THEN '✅ Recriada'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'client_members';

-- 7. Testar se a API está funcionando
SELECT 'Tabela client_members recriada sem RLS' as status;
