ALTER TABLE agent_output
RENAME TO ia_usage_log;

ALTER TABLE ia_usage_log
DROP COLUMN IF EXISTS updated_at,
DROP COLUMN IF EXISTS is_current,
DROP COLUMN IF EXISTS parent_id,
ALTER COLUMN agent_name DROP NOT NULL,
ALTER COLUMN instruction DROP NOT NULL,
ADD COLUMN IF NOT EXISTS agent_id uuid,
ADD constraint ia_usage_log_agent_id_fkey foreign KEY (agent_id) references agents (id) on delete SET NULL;

DROP TRIGGER IF EXISTS update_agent_output_updated_at ON ia_usage_log;
