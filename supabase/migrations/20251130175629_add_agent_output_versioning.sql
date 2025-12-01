-- Adiciona referência ao pai (versão anterior)
ALTER TABLE agent_output 
ADD COLUMN parent_id UUID REFERENCES agent_output(id);

-- Adiciona flag para identificar a versão atual/ativa
ALTER TABLE agent_output 
ADD COLUMN is_current BOOLEAN DEFAULT true NOT NULL;

-- Cria índices para performance (buscas de histórico e buscas de itens ativos)
CREATE INDEX idx_agent_output_parent_id ON agent_output(parent_id);
CREATE INDEX idx_agent_output_is_current ON agent_output(is_current);