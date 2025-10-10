-- Script para corrigir TODAS as políticas RLS problemáticas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover TODAS as políticas RLS das tabelas do sistema de clientes
DROP POLICY IF EXISTS "Users can view clients they are members of" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Client admins and owners can update clients" ON clients;

DROP POLICY IF EXISTS "Users can view members of their clients" ON client_members;
DROP POLICY IF EXISTS "Client admins and owners can manage members" ON client_members;
DROP POLICY IF EXISTS "Client owners can add members" ON client_members;
DROP POLICY IF EXISTS "Client owners can update members" ON client_members;
DROP POLICY IF EXISTS "Client owners can remove members" ON client_members;

DROP POLICY IF EXISTS "Client members can view settings" ON client_settings;
DROP POLICY IF EXISTS "Client admins and owners can manage settings" ON client_settings;

DROP POLICY IF EXISTS "Client members can view inputs" ON client_inputs;
DROP POLICY IF EXISTS "Client editors and admins can manage inputs" ON client_inputs;

DROP POLICY IF EXISTS "Client members can view knowledge bases" ON knowledge_bases;
DROP POLICY IF EXISTS "Client editors and admins can manage knowledge bases" ON knowledge_bases;

DROP POLICY IF EXISTS "Client members can view kb items" ON kb_items;
DROP POLICY IF EXISTS "Client editors and admins can manage kb items" ON kb_items;

DROP POLICY IF EXISTS "Client members can view news sources" ON news_sources;
DROP POLICY IF EXISTS "Client editors and admins can manage news sources" ON news_sources;

DROP POLICY IF EXISTS "Client members can view search integrations" ON search_integrations;
DROP POLICY IF EXISTS "Client admins and owners can manage search integrations" ON search_integrations;

DROP POLICY IF EXISTS "Client members can view agent profiles" ON agent_profiles;
DROP POLICY IF EXISTS "Client editors and admins can manage agent profiles" ON agent_profiles;

DROP POLICY IF EXISTS "Client members can view search usage" ON search_usage;

-- 2. Criar políticas RLS simplificadas e seguras

-- Políticas para clients
CREATE POLICY "Users can view their own clients" ON clients
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create clients" ON clients
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own clients" ON clients
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own clients" ON clients
  FOR DELETE USING (created_by = auth.uid());

-- Políticas para client_members (sem recursão)
CREATE POLICY "Users can view members of their clients" ON client_members
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage members of their clients" ON client_members
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

-- Políticas para client_settings
CREATE POLICY "Users can view settings of their clients" ON client_settings
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage settings of their clients" ON client_settings
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

-- Políticas para client_inputs
CREATE POLICY "Users can view inputs of their clients" ON client_inputs
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage inputs of their clients" ON client_inputs
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

-- Políticas para knowledge_bases
CREATE POLICY "Users can view knowledge bases of their clients" ON knowledge_bases
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage knowledge bases of their clients" ON knowledge_bases
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

-- Políticas para kb_items
CREATE POLICY "Users can view kb items of their clients" ON kb_items
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage kb items of their clients" ON kb_items
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

-- Políticas para news_sources
CREATE POLICY "Users can view news sources of their clients" ON news_sources
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage news sources of their clients" ON news_sources
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

-- Políticas para search_integrations
CREATE POLICY "Users can view search integrations of their clients" ON search_integrations
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage search integrations of their clients" ON search_integrations
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

-- Políticas para agent_profiles
CREATE POLICY "Users can view agent profiles of their clients" ON agent_profiles
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage agent profiles of their clients" ON agent_profiles
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

-- Políticas para search_usage
CREATE POLICY "Users can view search usage of their clients" ON search_usage
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

-- 3. Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('clients', 'client_members', 'client_settings', 'client_inputs', 'knowledge_bases', 'kb_items', 'news_sources', 'search_integrations', 'agent_profiles', 'search_usage')
ORDER BY tablename, policyname;
