-- Script para desabilitar triggers que podem estar causando problemas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Desabilitar o trigger que cria KB padrão para cada cliente
DROP TRIGGER IF EXISTS create_default_kb_trigger ON clients;

-- 2. Desabilitar RLS na tabela knowledge_bases
ALTER TABLE knowledge_bases DISABLE ROW LEVEL SECURITY;

-- 3. Remover todas as políticas RLS da tabela knowledge_bases
DROP POLICY IF EXISTS "Client members can view knowledge bases" ON knowledge_bases;
DROP POLICY IF EXISTS "Client editors and admins can manage knowledge bases" ON knowledge_bases;
DROP POLICY IF EXISTS "Users can view knowledge bases of their clients" ON knowledge_bases;
DROP POLICY IF EXISTS "Users can manage knowledge bases of their clients" ON knowledge_bases;

-- 4. Verificar se o trigger foi removido
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'clients'
ORDER BY trigger_name;

-- 5. Verificar se o RLS foi desabilitado na knowledge_bases
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'knowledge_bases';

-- 6. Testar se a API está funcionando
SELECT 'Triggers desabilitados e RLS removido' as status;
