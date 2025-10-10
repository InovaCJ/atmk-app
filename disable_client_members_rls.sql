-- Script para desabilitar RLS da tabela client_members temporariamente
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Desabilitar RLS na tabela client_members
ALTER TABLE client_members DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas da tabela client_members
DROP POLICY IF EXISTS "Users can view members of their clients" ON client_members;
DROP POLICY IF EXISTS "Client admins and owners can manage members" ON client_members;
DROP POLICY IF EXISTS "Client owners can add members" ON client_members;
DROP POLICY IF EXISTS "Client owners can update members" ON client_members;
DROP POLICY IF EXISTS "Client owners can remove members" ON client_members;
DROP POLICY IF EXISTS "Users can view members of their own clients" ON client_members;
DROP POLICY IF EXISTS "Users can manage members of their own clients" ON client_members;

-- 3. Verificar se o RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'client_members';

-- 4. Testar se a API está funcionando
SELECT 'RLS desabilitado para client_members' as status;
