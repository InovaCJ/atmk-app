-- Script para corrigir recursão infinita nas políticas RLS
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover políticas problemáticas que causam recursão infinita
DROP POLICY IF EXISTS "Users can view members of their clients" ON client_members;
DROP POLICY IF EXISTS "Client admins and owners can manage members" ON client_members;

-- 2. Criar políticas RLS corrigidas para client_members
-- Política para SELECT: usuários podem ver membros dos clientes que eles criaram ou dos quais são membros
CREATE POLICY "Users can view members of their clients" ON client_members
  FOR SELECT USING (
    -- Usuário é o criador do cliente
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR
    -- Usuário é membro do cliente (evita recursão)
    user_id = auth.uid()
  );

-- Política para INSERT: usuários podem adicionar membros aos clientes que criaram
CREATE POLICY "Client owners can add members" ON client_members
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

-- Política para UPDATE: usuários podem atualizar membros dos clientes que criaram
CREATE POLICY "Client owners can update members" ON client_members
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

-- Política para DELETE: usuários podem remover membros dos clientes que criaram
CREATE POLICY "Client owners can remove members" ON client_members
  FOR DELETE USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

-- 3. Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'client_members'
ORDER BY policyname;
