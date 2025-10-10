-- Script para recriar a tabela knowledge_bases sem RLS
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover o trigger que cria KB padrão para cada cliente
DROP TRIGGER IF EXISTS create_default_kb_trigger ON clients;

-- 2. Remover a função que cria KB padrão
DROP FUNCTION IF EXISTS create_default_kb_for_client();

-- 3. Remover todas as políticas RLS da tabela knowledge_bases
DROP POLICY IF EXISTS "Client members can view knowledge bases" ON knowledge_bases;
DROP POLICY IF EXISTS "Client editors and admins can manage knowledge bases" ON knowledge_bases;
DROP POLICY IF EXISTS "Users can view knowledge bases of their clients" ON knowledge_bases;
DROP POLICY IF EXISTS "Users can manage knowledge bases of their clients" ON knowledge_bases;

-- 4. Desabilitar RLS na tabela knowledge_bases
ALTER TABLE knowledge_bases DISABLE ROW LEVEL SECURITY;

-- 5. Remover a tabela knowledge_bases completamente
DROP TABLE IF EXISTS knowledge_bases CASCADE;

-- 6. Recriar a tabela knowledge_bases sem RLS
CREATE TABLE knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  indexing_policy kb_indexing_policy DEFAULT 'fulltext+embeddings',
  vector_store vector_store DEFAULT 'pgvector',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_client_id ON knowledge_bases(client_id);

-- 8. Verificar se a tabela foi criada corretamente
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'knowledge_bases' 
    THEN '✅ Recriada'
    ELSE '❌ Não encontrada'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'knowledge_bases';

-- 9. Testar se a API está funcionando
SELECT 'Tabela knowledge_bases recriada sem RLS' as status;
