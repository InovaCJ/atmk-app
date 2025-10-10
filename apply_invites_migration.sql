-- Script para aplicar migração da tabela client_invites e corrigir problemas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar enum invite_status se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
        CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
    END IF;
END $$;

-- 2. Criar tabela client_invites
CREATE TABLE IF NOT EXISTS client_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role client_role NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status invite_status DEFAULT 'pending',
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, email)
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_client_invites_client_id ON client_invites(client_id);
CREATE INDEX IF NOT EXISTS idx_client_invites_email ON client_invites(email);
CREATE INDEX IF NOT EXISTS idx_client_invites_token ON client_invites(token);
CREATE INDEX IF NOT EXISTS idx_client_invites_status ON client_invites(status);

-- 4. Verificar se a tabela profiles existe e tem a estrutura correta
DO $$
BEGIN
    -- Verificar se a tabela profiles existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    END IF;
END $$;

-- 5. Verificar se a tabela client_members existe e tem a estrutura correta
DO $$
BEGIN
    -- Verificar se a tabela client_members existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_members') THEN
        CREATE TABLE client_members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role client_role NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            UNIQUE(client_id, user_id)
        );
    END IF;
END $$;

-- 6. Verificar se a tabela client_settings existe
DO $$
BEGIN
    -- Verificar se a tabela client_settings existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_settings') THEN
        CREATE TABLE client_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            tone_of_voice TEXT,
            style_guidelines TEXT,
            prompt_directives TEXT,
            locale TEXT,
            duplication_of UUID REFERENCES clients(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            UNIQUE(client_id)
        );
    END IF;
END $$;

-- 7. Desabilitar RLS temporariamente para testar
ALTER TABLE IF EXISTS clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- 8. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para client_invites
DROP TRIGGER IF EXISTS update_client_invites_updated_at ON client_invites;
CREATE TRIGGER update_client_invites_updated_at
  BEFORE UPDATE ON client_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Função para expirar convites antigos
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
BEGIN
  UPDATE client_invites 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 11. Verificar se as tabelas foram criadas corretamente
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name IN ('clients', 'client_members', 'client_invites', 'client_settings', 'profiles')
ORDER BY table_name;

-- 12. Verificar se os enums foram criados
SELECT 
  typname as enum_name,
  enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE typname IN ('client_role', 'invite_status')
ORDER BY typname, enumlabel;

-- 13. Status final
SELECT 'Migração aplicada com sucesso!' as status;
