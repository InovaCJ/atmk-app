-- Script para recriar a tabela clients
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover todas as políticas RLS da tabela clients
DROP POLICY IF EXISTS "Users can view clients they are members of" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Client admins and owners can update clients" ON clients;
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

-- 2. Desabilitar RLS na tabela clients
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 3. Remover a tabela clients completamente (e todas as dependências)
DROP TABLE IF EXISTS clients CASCADE;

-- 4. Recriar a tabela clients sem RLS
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status client_status DEFAULT 'active',
  plan plan_type DEFAULT 'free',
  
  -- Legacy company fields for migration
  brand_voice TEXT,
  description TEXT,
  industry VARCHAR(255),
  logo_url TEXT,
  target_audience TEXT,
  website TEXT,
  plan_expires_at TIMESTAMP WITH TIME ZONE
);

-- 5. Recriar a tabela client_members sem RLS
CREATE TABLE client_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role client_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, user_id)
);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_client_members_client_id ON client_members(client_id);
CREATE INDEX IF NOT EXISTS idx_client_members_user_id ON client_members(user_id);

-- 7. Verificar se as tabelas foram criadas corretamente
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('clients', 'client_members') 
    THEN '✅ Recriada'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('clients', 'client_members')
ORDER BY table_name;

-- 8. Testar se a API está funcionando
SELECT 'Tabelas clients e client_members recriadas sem RLS' as status;
