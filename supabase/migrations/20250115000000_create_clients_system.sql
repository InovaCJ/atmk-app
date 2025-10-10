-- Migration: Create Clients Multi-Tenant System
-- Description: Implements multi-tenant client management with RBAC and isolated data

-- Create new enums for the clients system
CREATE TYPE client_status AS ENUM ('active', 'archived');
CREATE TYPE client_role AS ENUM ('client_admin', 'editor', 'viewer');
CREATE TYPE input_type AS ENUM ('text', 'file', 'url', 'structured');
CREATE TYPE kb_indexing_policy AS ENUM ('fulltext+embeddings', 'raw');
CREATE TYPE vector_store AS ENUM ('pgvector', 'pinecone', 'qdrant', 'weaviate');
CREATE TYPE news_source_type AS ENUM ('rss', 'api', 'scraper');
CREATE TYPE search_provider AS ENUM ('serpapi', 'tavily', 'bing', 'custom');
CREATE TYPE kb_source_type AS ENUM ('input', 'url', 'file', 'news', 'manual');

-- Clients table (replaces companies with multi-tenant structure)
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

-- Client members (RBAC)
CREATE TABLE client_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role client_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, user_id)
);

-- Client settings (tom de voz, diretrizes, etc.)
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

-- Client inputs (textos, arquivos, URLs)
CREATE TABLE client_inputs (
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

-- Knowledge bases per client
CREATE TABLE knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  indexing_policy kb_indexing_policy DEFAULT 'fulltext+embeddings',
  vector_store vector_store DEFAULT 'pgvector',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge base items (chunks with embeddings)
CREATE TABLE kb_items (
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

-- News sources per client
CREATE TABLE news_sources (
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

-- Search integrations (PRO features)
CREATE TABLE search_integrations (
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

-- Agent profiles per client
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

-- Search usage tracking (for billing)
CREATE TABLE search_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  provider search_provider NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 1,
  cost_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_clients_created_by ON clients(created_by);
CREATE INDEX idx_clients_slug ON clients(slug);
CREATE INDEX idx_client_members_client_id ON client_members(client_id);
CREATE INDEX idx_client_members_user_id ON client_members(user_id);
CREATE INDEX idx_client_inputs_client_id ON client_inputs(client_id);
CREATE INDEX idx_kb_items_client_id ON kb_items(client_id);
CREATE INDEX idx_kb_items_kb_id ON kb_items(kb_id);
CREATE INDEX idx_news_sources_client_id ON news_sources(client_id);
CREATE INDEX idx_search_integrations_client_id ON search_integrations(client_id);
CREATE INDEX idx_agent_profiles_client_id ON agent_profiles(client_id);
CREATE INDEX idx_search_usage_client_id ON search_usage(client_id);

-- Enable Row Level Security (RLS)
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

-- RLS Policies for clients
CREATE POLICY "Users can view clients they are members of" ON clients
  FOR SELECT USING (
    id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can create clients" ON clients
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Client admins and owners can update clients" ON clients
  FOR UPDATE USING (
    created_by = auth.uid() OR
    id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

-- RLS Policies for client_members
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

-- RLS Policies for client_settings
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

-- RLS Policies for client_inputs
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

-- RLS Policies for knowledge_bases
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

-- RLS Policies for kb_items
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

-- RLS Policies for news_sources
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

-- RLS Policies for search_integrations
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

-- RLS Policies for agent_profiles
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

-- RLS Policies for search_usage
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

-- Create default knowledge base for each client
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

CREATE TRIGGER create_default_kb_trigger
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_default_kb_for_client();

-- Migration function to convert existing companies to clients
CREATE OR REPLACE FUNCTION migrate_companies_to_clients()
RETURNS void AS $$
DECLARE
  company_record RECORD;
  new_client_id UUID;
BEGIN
  FOR company_record IN SELECT * FROM companies LOOP
    -- Create new client
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
    
    -- Add owner as client_admin
    INSERT INTO client_members (client_id, user_id, role)
    VALUES (new_client_id, company_record.owner_id, 'client_admin');
    
    -- Migrate knowledge_base to kb_items
    INSERT INTO kb_items (kb_id, client_id, source_type, text, metadata, created_at)
    SELECT 
      (SELECT id FROM knowledge_bases WHERE client_id = new_client_id LIMIT 1),
      new_client_id,
      'manual',
      kb.content,
      jsonb_build_object(
        'title', kb.title,
        'content_type', kb.content_type,
        'source_url', kb.source_url,
        'tags', kb.tags
      ),
      kb.created_at
    FROM knowledge_base kb
    WHERE kb.company_id = company_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run migration (uncomment when ready)
-- SELECT migrate_companies_to_clients();
