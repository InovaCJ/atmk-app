-- Script para recriar todas as tabelas do sistema de clientes sem RLS
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover todos os triggers e funções
DROP TRIGGER IF EXISTS create_default_kb_trigger ON clients;
DROP FUNCTION IF EXISTS create_default_kb_for_client();
DROP FUNCTION IF EXISTS migrate_companies_to_clients();

-- 2. Remover todas as tabelas do sistema de clientes (CASCADE remove todas as dependências)
DROP TABLE IF EXISTS search_usage CASCADE;
DROP TABLE IF EXISTS agent_profiles CASCADE;
DROP TABLE IF EXISTS search_integrations CASCADE;
DROP TABLE IF EXISTS news_sources CASCADE;
DROP TABLE IF EXISTS kb_items CASCADE;
DROP TABLE IF EXISTS knowledge_bases CASCADE;
DROP TABLE IF EXISTS client_inputs CASCADE;
DROP TABLE IF EXISTS client_settings CASCADE;
DROP TABLE IF EXISTS client_members CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- 3. Recriar a tabela clients sem RLS
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

-- 4. Recriar a tabela client_members sem RLS
CREATE TABLE client_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role client_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, user_id)
);

-- 5. Recriar a tabela client_settings sem RLS
CREATE TABLE client_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tone_of_voice TEXT,
  style_guidelines TEXT,
  prompt_directives TEXT,
  locale VARCHAR(10) DEFAULT 'pt-BR',
  duplication_of UUID REFERENCES clients(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id)
);

-- 6. Recriar a tabela client_inputs sem RLS
CREATE TABLE client_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type input_type NOT NULL,
  title VARCHAR(255),
  content_text TEXT,
  file_ref TEXT,
  url TEXT,
  metadata JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Recriar a tabela knowledge_bases sem RLS
CREATE TABLE knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  indexing_policy kb_indexing_policy DEFAULT 'fulltext+embeddings',
  vector_store vector_store DEFAULT 'pgvector',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Recriar a tabela kb_items sem RLS
CREATE TABLE kb_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  source_type kb_source_type NOT NULL,
  source_ref TEXT,
  chunk_id VARCHAR(255),
  text TEXT NOT NULL,
  embeddings_ref TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, kb_id, chunk_id)
);

-- 9. Recriar a tabela news_sources sem RLS
CREATE TABLE news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type news_source_type NOT NULL,
  url TEXT,
  api_config JSONB,
  schedule VARCHAR(100) DEFAULT '0 */6 * * *',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Recriar a tabela search_integrations sem RLS
CREATE TABLE search_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  provider search_provider NOT NULL,
  api_key_ref TEXT NOT NULL,
  daily_quota INTEGER,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, provider)
);

-- 11. Recriar a tabela agent_profiles sem RLS
CREATE TABLE agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  system_prompt TEXT NOT NULL,
  tools TEXT[] DEFAULT '{}',
  rate_limits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Recriar a tabela search_usage sem RLS
CREATE TABLE search_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  provider search_provider NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 1,
  cost_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_client_members_client_id ON client_members(client_id);
CREATE INDEX IF NOT EXISTS idx_client_members_user_id ON client_members(user_id);
CREATE INDEX IF NOT EXISTS idx_client_inputs_client_id ON client_inputs(client_id);
CREATE INDEX IF NOT EXISTS idx_kb_items_client_id ON kb_items(client_id);
CREATE INDEX IF NOT EXISTS idx_kb_items_kb_id ON kb_items(kb_id);
CREATE INDEX IF NOT EXISTS idx_news_sources_client_id ON news_sources(client_id);
CREATE INDEX IF NOT EXISTS idx_search_integrations_client_id ON search_integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_client_id ON agent_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_search_usage_client_id ON search_usage(client_id);

-- 14. Verificar se as tabelas foram criadas corretamente
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('clients', 'client_members', 'client_settings', 'client_inputs', 'knowledge_bases', 'kb_items', 'news_sources', 'search_integrations', 'agent_profiles', 'search_usage') 
    THEN '✅ Recriada'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('clients', 'client_members', 'client_settings', 'client_inputs', 'knowledge_bases', 'kb_items', 'news_sources', 'search_integrations', 'agent_profiles', 'search_usage')
ORDER BY table_name;

-- 15. Testar se a API está funcionando
SELECT 'Todas as tabelas do sistema de clientes recriadas sem RLS' as status;
