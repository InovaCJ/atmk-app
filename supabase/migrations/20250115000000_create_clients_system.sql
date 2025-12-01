drop schema if exists public cascade;
create schema public;

-- Reset grants consistent with Supabase defaults:
grant usage on schema public to postgres, anon, authenticated, service_role;
grant create on schema public to postgres, service_role;


-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create shared enum types
CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'business');
CREATE TYPE public.content_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
CREATE TYPE public.ai_model AS ENUM ('openai_gpt4', 'openai_gpt35', 'google_gemini', 'perplexity', 'deepseek', 'claude', 'grok');
CREATE TYPE public.content_type AS ENUM ('post', 'story', 'reel', 'article', 'newsletter');

-- Create client-specific enums
DO $$ 
BEGIN
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

-- Table for user profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status client_status DEFAULT 'active',
  plan plan_type DEFAULT 'free'
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

-- Client settings
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

-- Client inputs
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

-- Knowledge base items
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

-- News sources per client
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

-- Search integrations
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

-- Search usage tracking
CREATE TABLE search_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  provider search_provider NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 1,
  cost_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_client_members_user_id ON client_members(user_id);
CREATE INDEX IF NOT EXISTS idx_client_members_client_id ON client_members(client_id);

-- Functions and Triggers
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger to create a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically update 'updated_at' columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply 'updated_at' triggers to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_settings_updated_at BEFORE UPDATE ON public.client_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_inputs_updated_at BEFORE UPDATE ON public.client_inputs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_bases_updated_at BEFORE UPDATE ON public.knowledge_bases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_news_sources_updated_at BEFORE UPDATE ON public.news_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_search_integrations_updated_at BEFORE UPDATE ON public.search_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_profiles_updated_at BEFORE UPDATE ON public.agent_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default items for a new client
CREATE OR REPLACE FUNCTION create_default_items_for_client()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO knowledge_bases (client_id, name) VALUES (NEW.id, 'Principal');
  INSERT INTO client_settings (client_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default items when a new client is created
CREATE TRIGGER create_default_items_trigger
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_default_items_for_client();

-- =============================================================================
-- HELPER FUNCTIONS PARA RLS (QUEBRANDO RECURSÃO)
-- =============================================================================

-- Function to get clients owned by the current user (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_owned_clients()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM clients WHERE created_by = auth.uid();
$$;

-- Function to get clients where the current user is a member (Bypasses RLS to avoid loop in client_members)
CREATE OR REPLACE FUNCTION public.get_member_client_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT client_id FROM client_members WHERE user_id = auth.uid();
$$;

-- =============================================================================
-- GRANTS (PERMISSÕES DE TABELAS)
-- =============================================================================
-- Como recriamos o schema public, precisamos reaplicar os grants básicos
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_owned_clients TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_member_client_ids TO authenticated, service_role;


-- Row Level Security (RLS)
-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
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

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Profiles
DROP POLICY IF EXISTS "Authenticated users can manage their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can manage their own profile" 
  ON public.profiles FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- CLIENTS TABLE
-- =============================================================================

-- SELECT: Usuários veem clients que criaram OU que são membros (via função segura)
DROP POLICY IF EXISTS "Users can view clients they are members of or own" ON clients;
CREATE POLICY "Users can view clients they are members of or own" 
  ON clients FOR SELECT 
  USING (
    created_by = auth.uid() 
    OR id IN (SELECT get_member_client_ids())
  );

-- INSERT: Qualquer usuário autenticado pode criar um client
DROP POLICY IF EXISTS "Users can create clients" ON clients;
CREATE POLICY "Users can create clients" 
  ON clients FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- UPDATE: Apenas owners e admins podem atualizar
DROP POLICY IF EXISTS "Client admins and owners can update clients" ON clients;
CREATE POLICY "Client admins and owners can update clients" 
  ON clients FOR UPDATE 
  USING (
    created_by = auth.uid() 
    OR id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

-- DELETE: Apenas owners podem deletar
DROP POLICY IF EXISTS "Only owners can delete clients" ON clients;
CREATE POLICY "Only owners can delete clients" 
  ON clients FOR DELETE 
  USING (created_by = auth.uid());

-- =============================================================================
-- CLIENT_MEMBERS TABLE - Uso de funções Security Definer é vital aqui
-- =============================================================================

-- SELECT: Usuários veem membros dos clients que fazem parte
DROP POLICY IF EXISTS "Users can view members of their clients" ON client_members;
CREATE POLICY "Users can view members of their clients" 
  ON client_members FOR SELECT 
  USING (
    -- Vê seus próprios registros
    user_id = auth.uid()
    OR
    -- Vê membros de clients onde é owner
    client_id IN (SELECT get_owned_clients())
    OR
    -- Vê membros de clients onde é membro (sem recursão na tabela)
    client_id IN (SELECT get_member_client_ids())
  );

-- INSERT: Apenas owners e admins podem adicionar membros
DROP POLICY IF EXISTS "Client admins and owners can add members" ON client_members;
CREATE POLICY "Client admins and owners can add members" 
  ON client_members FOR INSERT 
  WITH CHECK (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

-- UPDATE: Apenas owners e admins podem atualizar roles
DROP POLICY IF EXISTS "Client admins and owners can update members" ON client_members;
CREATE POLICY "Client admins and owners can update members" 
  ON client_members FOR UPDATE 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

-- DELETE: Apenas owners e admins podem remover membros
DROP POLICY IF EXISTS "Client admins and owners can delete members" ON client_members;
CREATE POLICY "Client admins and owners can delete members" 
  ON client_members FOR DELETE 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

-- =============================================================================
-- CLIENT_SETTINGS
-- =============================================================================

DROP POLICY IF EXISTS "Client members can view settings" ON client_settings;
CREATE POLICY "Client members can view settings" 
  ON client_settings FOR SELECT 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (SELECT get_member_client_ids())
  );

DROP POLICY IF EXISTS "Client admins and owners can manage settings" ON client_settings;
CREATE POLICY "Client admins and owners can manage settings" 
  ON client_settings FOR ALL 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

-- =============================================================================
-- DEMAIS TABELAS - Padronizando com as funções auxiliares
-- =============================================================================

-- CLIENT_INPUTS
DROP POLICY IF EXISTS "Client members can access their client data" ON client_inputs;
CREATE POLICY "Client members can access their client data" 
  ON client_inputs FOR ALL 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (SELECT get_member_client_ids())
  );

-- KNOWLEDGE_BASES
DROP POLICY IF EXISTS "Client members can access their client data" ON knowledge_bases;
CREATE POLICY "Client members can access their client data" 
  ON knowledge_bases FOR ALL 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (SELECT get_member_client_ids())
  );

-- KB_ITEMS
DROP POLICY IF EXISTS "Client members can access their client data" ON kb_items;
CREATE POLICY "Client members can access their client data" 
  ON kb_items FOR ALL 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (SELECT get_member_client_ids())
  );

-- NEWS_SOURCES
DROP POLICY IF EXISTS "Client members can access their client data" ON news_sources;
CREATE POLICY "Client members can access their client data" 
  ON news_sources FOR ALL 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (SELECT get_member_client_ids())
  );

-- SEARCH_INTEGRATIONS
DROP POLICY IF EXISTS "Client members can access their client data" ON search_integrations;
CREATE POLICY "Client members can access their client data" 
  ON search_integrations FOR ALL 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (SELECT get_member_client_ids())
  );

-- AGENT_PROFILES
DROP POLICY IF EXISTS "Client members can access their client data" ON agent_profiles;
CREATE POLICY "Client members can access their client data" 
  ON agent_profiles FOR ALL 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (SELECT get_member_client_ids())
  );

-- SEARCH_USAGE
DROP POLICY IF EXISTS "Client members can access their client data" ON search_usage;
CREATE POLICY "Client members can access their client data" 
  ON search_usage FOR ALL 
  USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (SELECT get_member_client_ids())
  );