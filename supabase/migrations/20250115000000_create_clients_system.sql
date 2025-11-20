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

-- RLS Helper Functions (to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_member_of(_client_id UUID)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  RETURN EXISTS (SELECT 1 FROM client_members WHERE client_id = _client_id AND user_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_of(_client_id UUID)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  RETURN EXISTS (SELECT 1 FROM client_members WHERE client_id = _client_id AND user_id = auth.uid() AND role = 'client_admin');
END;
$$;

-- RLS Policies
-- Profiles
CREATE POLICY "Authenticated users can manage their own profile" ON public.profiles
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Clients
CREATE POLICY "Users can view clients they are members of or own" ON clients
  FOR SELECT USING (public.is_member_of(id) OR created_by = auth.uid());
CREATE POLICY "Users can create clients" ON clients
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Client admins and owners can update clients" ON clients
  FOR UPDATE USING (created_by = auth.uid() OR public.is_admin_of(id));

-- Client Members
CREATE POLICY "Users can view members of their clients" ON client_members
  FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()) OR public.is_member_of(client_id));
CREATE POLICY "Client admins and owners can manage members" ON client_members
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()) OR public.is_admin_of(client_id));

-- Client Settings
CREATE POLICY "Client members can view settings" ON client_settings
  FOR SELECT USING (public.is_member_of(client_id) OR client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));
CREATE POLICY "Client admins and owners can manage settings" ON client_settings
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()) OR public.is_admin_of(client_id));

-- Generic policies for other tables (pode ser refinado depois)
CREATE POLICY "Client members can access their client data" ON client_inputs FOR ALL USING (public.is_member_of(client_id) OR client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));
CREATE POLICY "Client members can access their client data" ON knowledge_bases FOR ALL USING (public.is_member_of(client_id) OR client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));
CREATE POLICY "Client members can access their client data" ON kb_items FOR ALL USING (public.is_member_of(client_id) OR client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));
CREATE POLICY "Client members can access their client data" ON news_sources FOR ALL USING (public.is_member_of(client_id) OR client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));
CREATE POLICY "Client members can access their client data" ON search_integrations FOR ALL USING (public.is_member_of(client_id) OR client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));
CREATE POLICY "Client members can access their client data" ON agent_profiles FOR ALL USING (public.is_member_of(client_id) OR client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));
CREATE POLICY "Client members can access their client data" ON search_usage FOR ALL USING (public.is_member_of(client_id) OR client_id IN (SELECT id FROM clients WHERE created_by = auth.uid()));