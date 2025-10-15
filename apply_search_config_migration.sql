-- Script para aplicar migração de configurações de busca
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar se os campos já existem
DO $$ 
BEGIN
    -- Adicionar search_terms se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client_settings' 
        AND column_name = 'search_terms'
    ) THEN
        ALTER TABLE client_settings ADD COLUMN search_terms JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Campo search_terms adicionado';
    ELSE
        RAISE NOTICE 'Campo search_terms já existe';
    END IF;

    -- Adicionar search_frequencies se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client_settings' 
        AND column_name = 'search_frequencies'
    ) THEN
        ALTER TABLE client_settings ADD COLUMN search_frequencies JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Campo search_frequencies adicionado';
    ELSE
        RAISE NOTICE 'Campo search_frequencies já existe';
    END IF;
END $$;

-- Atualizar registros existentes com configurações padrão
UPDATE client_settings 
SET 
  search_terms = '[
    {"id": "1", "term": "", "enabled": false},
    {"id": "2", "term": "", "enabled": false},
    {"id": "3", "term": "", "enabled": false},
    {"id": "4", "term": "", "enabled": false},
    {"id": "5", "term": "", "enabled": false}
  ]'::jsonb,
  search_frequencies = '[
    {"id": "1", "frequency": "daily", "enabled": true},
    {"id": "2", "frequency": "weekly", "enabled": false},
    {"id": "3", "frequency": "monthly", "enabled": false}
  ]'::jsonb
WHERE search_terms IS NULL OR search_frequencies IS NULL;

-- Verificar se a migração foi aplicada com sucesso
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'client_settings' 
AND column_name IN ('search_terms', 'search_frequencies')
ORDER BY column_name;
