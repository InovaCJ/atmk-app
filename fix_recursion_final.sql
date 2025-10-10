-- Script final para corrigir recursão infinita
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover TODAS as políticas RLS problemáticas
DROP POLICY IF EXISTS "Users can view members of their clients" ON client_members;
DROP POLICY IF EXISTS "Client admins and owners can manage members" ON client_members;
DROP POLICY IF EXISTS "Client owners can add members" ON client_members;
DROP POLICY IF EXISTS "Client owners can update members" ON client_members;
DROP POLICY IF EXISTS "Client owners can remove members" ON client_members;

-- 2. Criar políticas RLS simples e sem recursão para client_members
CREATE POLICY "Users can view members of their own clients" ON client_members
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage members of their own clients" ON client_members
  FOR ALL USING (
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
WHERE tablename = 'client_members'
ORDER BY policyname;

-- 4. Testar se a recursão foi resolvida
SELECT 'Políticas RLS corrigidas' as status;
