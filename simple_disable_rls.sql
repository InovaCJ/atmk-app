-- Script simples para desabilitar RLS e remover políticas problemáticas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover TODAS as políticas RLS das tabelas
DROP POLICY IF EXISTS "Users can view clients they are members of" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Client admins and owners can update clients" ON clients;
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

DROP POLICY IF EXISTS "Users can view members of their clients" ON client_members;
DROP POLICY IF EXISTS "Client admins and owners can manage members" ON client_members;
DROP POLICY IF EXISTS "Client owners can add members" ON client_members;
DROP POLICY IF EXISTS "Client owners can update members" ON client_members;
DROP POLICY IF EXISTS "Client owners can remove members" ON client_members;
DROP POLICY IF EXISTS "Users can view members of their own clients" ON client_members;
DROP POLICY IF EXISTS "Users can manage members of their own clients" ON client_members;

-- 2. Desabilitar RLS nas tabelas
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_members DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se o RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('clients', 'client_members')
ORDER BY tablename;

-- 4. Verificar se não há políticas RLS ativas
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename IN ('clients', 'client_members')
ORDER BY tablename, policyname;

-- 5. Testar se a API está funcionando
SELECT 'RLS desabilitado para clients e client_members' as status;
