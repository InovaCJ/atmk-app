-- Script para debugar a tabela clients
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se há triggers na tabela clients
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'clients'
ORDER BY trigger_name;

-- 2. Verificar se há funções que referenciam clients
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_definition LIKE '%clients%' 
  AND routine_schema = 'public'
ORDER BY routine_name;

-- 3. Verificar se há políticas RLS na tabela clients
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'clients'
ORDER BY policyname;

-- 4. Verificar se o RLS está habilitado na tabela clients
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'clients';

-- 5. Verificar se há algum problema com as foreign keys da tabela clients
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'clients';

-- 6. Verificar se há algum problema com a estrutura da tabela clients
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Tentar uma consulta simples na tabela clients
SELECT COUNT(*) as clients_count FROM clients;

-- 8. Verificar se há algum problema com as referências da tabela clients
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'clients';
