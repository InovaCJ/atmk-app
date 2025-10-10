-- Script para aplicar a migração do sistema de clientes no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar enums necessários (apenas se não existirem)
DO $$ 
BEGIN
    -- Verificar e criar enums se não existirem
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_status') THEN
        CREATE TYPE client_status AS ENUM ('active', 'archived');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_role') THEN
        CREATE TYPE client_role AS ENUM ('client_admin', 'editor', 'viewer');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'input_type') THEN
        CREATE TYPE input_type AS ENUM ('text', 'file', 'url', 'structured');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kb_indexing_policy') THEN
        CREATE TYPE kb_indexing_policy AS ENUM ('fulltext+embeddings', 'raw');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector_store') THEN
        CREATE TYPE vector_store AS ENUM ('pgvector', 'pinecone', 'qdrant', 'weaviate');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'news_source_type') THEN
        CREATE TYPE news_source_type AS ENUM ('rss', 'api', 'scraper');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'search_provider') THEN
        CREATE TYPE search_provider AS ENUM ('serpapi', 'tavily', 'bing', 'custom');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kb_source_type') THEN
        CREATE TYPE kb_source_type AS ENUM ('input', 'url', 'file', 'news', 'manual');
    END IF;
END $$;

-- 2. Criar tabela clients
CREATE TABLE IF NOT EXISTS clients (
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

-- 3. Criar tabela client_members
CREATE TABLE IF NOT EXISTS client_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role client_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, user_id)
);

-- 4. Criar tabela client_settings
CREATE TABLE IF NOT EXISTS client_settings (
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

-- 5. Criar tabela client_inputs
CREATE TABLE IF NOT EXISTS client_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type input_type NOT NULL,
  title VARCHAR(255),
  content_text TEXT,
  file_ref TEXT, -- storage key
  url TEXT,
  metadata JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela knowledge_bases
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  indexing_policy kb_indexing_policy DEFAULT 'fulltext+embeddings',
  vector_store vector_store DEFAULT 'pgvector',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Criar tabela kb_items
CREATE TABLE IF NOT EXISTS kb_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  source_type kb_source_type NOT NULL,
  source_ref TEXT, -- id do ClientInput, URL, etc.
  chunk_id VARCHAR(255),
  text TEXT NOT NULL,
  embeddings_ref TEXT, -- reference to stored embeddings
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, kb_id, chunk_id)
);

-- 8. Criar tabela news_sources
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type news_source_type NOT NULL,
  url TEXT,
  api_config JSONB,
  schedule VARCHAR(100) DEFAULT '0 */6 * * *', -- cron expression
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Criar tabela search_integrations
CREATE TABLE IF NOT EXISTS search_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  provider search_provider NOT NULL,
  api_key_ref TEXT NOT NULL, -- encrypted reference
  daily_quota INTEGER,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, provider)
);

-- 10. Criar tabela agent_profiles
CREATE TABLE IF NOT EXISTS agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  system_prompt TEXT NOT NULL,
  tools TEXT[] DEFAULT '{}',
  rate_limits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Criar tabela search_usage
CREATE TABLE IF NOT EXISTS search_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  provider search_provider NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 1,
  cost_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Criar índices para performance
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

-- 13. Habilitar Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_usage ENABLE ROW LEVEL SECURITY;

-- 14. Criar políticas RLS para clients
DROP POLICY IF EXISTS "Users can view clients they are members of" ON clients;
CREATE POLICY "Users can view clients they are members of" ON clients
  FOR SELECT USING (
    id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create clients" ON clients;
CREATE POLICY "Users can create clients" ON clients
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Client admins and owners can update clients" ON clients;
CREATE POLICY "Client admins and owners can update clients" ON clients
  FOR UPDATE USING (
    created_by = auth.uid() OR
    id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

-- 15. Criar políticas RLS para client_members
DROP POLICY IF EXISTS "Users can view members of their clients" ON client_members;
CREATE POLICY "Users can view members of their clients" ON client_members
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE created_by = auth.uid() OR id IN (
        SELECT client_id FROM client_members 
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Client admins and owners can manage members" ON client_members;
CREATE POLICY "Client admins and owners can manage members" ON client_members
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

-- 16. Criar políticas RLS para client_settings
DROP POLICY IF EXISTS "Client members can view settings" ON client_settings;
CREATE POLICY "Client members can view settings" ON client_settings
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Client admins and owners can manage settings" ON client_settings;
CREATE POLICY "Client admins and owners can manage settings" ON client_settings
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

-- 17. Criar políticas RLS para client_inputs
DROP POLICY IF EXISTS "Client members can view inputs" ON client_inputs;
CREATE POLICY "Client members can view inputs" ON client_inputs
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Client editors and admins can manage inputs" ON client_inputs;
CREATE POLICY "Client editors and admins can manage inputs" ON client_inputs
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role IN ('client_admin', 'editor')
    )
  );

-- 18. Criar políticas RLS para knowledge_bases
DROP POLICY IF EXISTS "Client members can view knowledge bases" ON knowledge_bases;
CREATE POLICY "Client members can view knowledge bases" ON knowledge_bases
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Client editors and admins can manage knowledge bases" ON knowledge_bases;
CREATE POLICY "Client editors and admins can manage knowledge bases" ON knowledge_bases
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role IN ('client_admin', 'editor')
    )
  );

-- 19. Criar políticas RLS para kb_items
DROP POLICY IF EXISTS "Client members can view kb items" ON kb_items;
CREATE POLICY "Client members can view kb items" ON kb_items
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Client editors and admins can manage kb items" ON kb_items;
CREATE POLICY "Client editors and admins can manage kb items" ON kb_items
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role IN ('client_admin', 'editor')
    )
  );

-- 20. Criar políticas RLS para news_sources
DROP POLICY IF EXISTS "Client members can view news sources" ON news_sources;
CREATE POLICY "Client members can view news sources" ON news_sources
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Client editors and admins can manage news sources" ON news_sources;
CREATE POLICY "Client editors and admins can manage news sources" ON news_sources
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role IN ('client_admin', 'editor')
    )
  );

-- 21. Criar políticas RLS para search_integrations
DROP POLICY IF EXISTS "Client members can view search integrations" ON search_integrations;
CREATE POLICY "Client members can view search integrations" ON search_integrations
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Client admins and owners can manage search integrations" ON search_integrations;
CREATE POLICY "Client admins and owners can manage search integrations" ON search_integrations
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

-- 22. Criar políticas RLS para agent_profiles
DROP POLICY IF EXISTS "Client members can view agent profiles" ON agent_profiles;
CREATE POLICY "Client members can view agent profiles" ON agent_profiles
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Client editors and admins can manage agent profiles" ON agent_profiles;
CREATE POLICY "Client editors and admins can manage agent profiles" ON agent_profiles
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role IN ('client_admin', 'editor')
    )
  );

-- 23. Criar políticas RLS para search_usage
DROP POLICY IF EXISTS "Client members can view search usage" ON search_usage;
CREATE POLICY "Client members can view search usage" ON search_usage
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

-- 24. Criar função para criar KB padrão para cada cliente
CREATE OR REPLACE FUNCTION create_default_kb_for_client()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO knowledge_bases (client_id, name, indexing_policy, vector_store)
  VALUES (NEW.id, 'Principal', 'fulltext+embeddings', 'pgvector');
  
  INSERT INTO client_settings (client_id, tone_of_voice, style_guidelines, locale)
  VALUES (NEW.id, 'Claro e objetivo', 'Evite jargões desnecessários', 'pt-BR');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 25. Criar trigger para criar KB padrão
DROP TRIGGER IF EXISTS create_default_kb_trigger ON clients;
CREATE TRIGGER create_default_kb_trigger
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_default_kb_for_client();

-- 26. Criar função de migração de companies para clients (opcional)
CREATE OR REPLACE FUNCTION migrate_companies_to_clients()
RETURNS void AS $$
DECLARE
  company_record RECORD;
  new_client_id UUID;
BEGIN
  -- Verificar se a tabela companies existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    RAISE NOTICE 'Tabela companies não encontrada. Pulando migração.';
    RETURN;
  END IF;

  FOR company_record IN SELECT * FROM companies LOOP
    -- Verificar se o cliente já existe
    IF NOT EXISTS (SELECT 1 FROM clients WHERE id = company_record.id) THEN
      -- Criar novo cliente
      INSERT INTO clients (
        id, slug, name, created_by, created_at, updated_at, status, plan,
        brand_voice, description, industry, logo_url, target_audience, website, plan_expires_at
      ) VALUES (
        company_record.id,
        LOWER(REPLACE(company_record.name, ' ', '-')),
        company_record.name,
        company_record.owner_id,
        company_record.created_at,
        company_record.updated_at,
        'active',
        company_record.plan_type,
        company_record.brand_voice,
        company_record.description,
        company_record.industry,
        company_record.logo_url,
        company_record.target_audience,
        company_record.website,
        company_record.plan_expires_at
      ) RETURNING id INTO new_client_id;
      
      -- Adicionar owner como client_admin
      INSERT INTO client_members (client_id, user_id, role)
      VALUES (new_client_id, company_record.owner_id, 'client_admin');
      
      RAISE NOTICE 'Migrado company % para client %', company_record.name, new_client_id;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Migração de companies para clients concluída.';
END;
$$ LANGUAGE plpgsql;

-- 27. Executar migração de companies para clients (descomente se necessário)
-- SELECT migrate_companies_to_clients();

-- 28. Verificar se as tabelas foram criadas corretamente
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('clients', 'client_members', 'client_settings', 'client_inputs', 'knowledge_bases', 'kb_items', 'news_sources', 'search_integrations', 'agent_profiles', 'search_usage') 
    THEN '✅ Criada'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('clients', 'client_members', 'client_settings', 'client_inputs', 'knowledge_bases', 'kb_items', 'news_sources', 'search_integrations', 'agent_profiles', 'search_usage')
ORDER BY table_name;
