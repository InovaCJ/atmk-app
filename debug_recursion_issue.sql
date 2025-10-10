-- Script para debugar o problema de recursão infinita
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se há triggers que podem estar causando recursão
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('clients', 'client_members', 'client_settings', 'client_inputs', 'knowledge_bases', 'kb_items', 'news_sources', 'search_integrations', 'agent_profiles', 'search_usage')
ORDER BY event_object_table, trigger_name;

-- 2. Verificar se há funções que podem estar causando recursão
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%client%' 
  AND routine_schema = 'public'
ORDER BY routine_name;

-- 3. Verificar se há políticas RLS ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('clients', 'client_members', 'client_settings', 'client_inputs', 'knowledge_bases', 'kb_items', 'news_sources', 'search_integrations', 'agent_profiles', 'search_usage')
ORDER BY tablename, policyname;

-- 4. Verificar se o RLS está realmente desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('clients', 'client_members', 'client_settings', 'client_inputs', 'knowledge_bases', 'kb_items', 'news_sources', 'search_integrations', 'agent_profiles', 'search_usage')
ORDER BY tablename;

-- 5. Tentar uma consulta simples para ver se a tabela existe
SELECT COUNT(*) as client_count FROM clients;

-- 6. Verificar se há algum problema com a estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
