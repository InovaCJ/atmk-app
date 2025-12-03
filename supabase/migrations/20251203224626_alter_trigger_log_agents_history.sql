-- 5. Create trigger function to log changes
CREATE OR REPLACE FUNCTION log_agent_change_history() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO agent_change_history 
        VALUES (
            NEW.id,
            NEW.agent_name,
            NEW.instruction,
            NEW.model,
            NEW.schema_output,
            NEW.created_at,
            NEW.updated_at,
            'INSERT',
            now()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO agent_change_history 
        VALUES (
            NEW.id,
            NEW.agent_name,
            NEW.instruction,
            NEW.model,
            NEW.schema_output,
            NEW.created_at,
            NEW.updated_at,
            'UPDATE',
            now()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO agent_change_history 
        VALUES (
            OLD.id,
            OLD.agent_name,
            OLD.instruction,
            OLD.model,
            OLD.schema_output,
            OLD.created_at,
            OLD.updated_at,
            'DELETE',
            now()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agents_history_insert ON agents;
DROP TRIGGER IF EXISTS agents_history_update ON agents; 
DROP TRIGGER IF EXISTS agents_history_delete ON agents;
DROP TRIGGER IF EXISTS agents_history_delete ON agents;
DROP TRIGGER IF EXISTS agents_history_update ON agents;
DROP TRIGGER IF EXISTS agents_history_insert ON agents;

DROP FUNCTION IF EXISTS log_agents_history();

CREATE TRIGGER agents_history_insert
AFTER INSERT ON agents
FOR EACH ROW EXECUTE FUNCTION log_agent_change_history();

CREATE TRIGGER agents_history_update
AFTER UPDATE ON agents
FOR EACH ROW EXECUTE FUNCTION log_agent_change_history();

CREATE TRIGGER agents_history_delete
AFTER DELETE ON agents
FOR EACH ROW EXECUTE FUNCTION log_agent_change_history();


