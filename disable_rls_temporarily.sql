-- Script para desabilitar temporariamente o RLS e testar
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Desabilitar RLS temporariamente em todas as tabelas do sistema de clientes
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_inputs DISABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases DISABLE ROW LEVEL SECURITY;
ALTER TABLE kb_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_usage DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se as tabelas estão acessíveis
SELECT 'RLS desabilitado temporariamente' as status;

-- 3. Testar se a API está funcionando
-- Execute este comando no terminal após aplicar o script:
-- curl -s "https://bztjknnilcmfaromieaj.supabase.co/rest/v1/clients?select=id&limit=1" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dGprbm5pbGNtZmFyb21pZWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzMzMDgsImV4cCI6MjA3MjkwOTMwOH0.V8yUu1RwGmOjZ73Z7ofSmgleazjTbS1R7iZdimrw7rA"
