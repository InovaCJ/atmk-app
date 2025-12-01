-- 1. Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name text NOT NULL,
    instruction text NOT NULL,
    model text,
    schema_output jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz
);

-- 2. Grant permissions on agents table
GRANT SELECT, INSERT, UPDATE, DELETE ON agents TO authenticated;
GRANT ALL ON agents TO service_role;

-- 3. Create agents_history table for audit trail
CREATE TABLE IF NOT EXISTS agents_history (
    id uuid,
    agent_name text,
    instruction text,
    model text,
    schema_output jsonb,
    created_at timestamptz,
    updated_at timestamptz,
    operation_type text NOT NULL,
    operation_timestamp timestamptz NOT NULL DEFAULT now()
);

-- 4. Revoke public access to agents_history (optional, restrict access)
REVOKE ALL ON agents_history FROM public;
-- Grant only admin role or service_role select permission, adjust as needed
GRANT SELECT ON agents_history TO service_role;

-- 5. Create trigger function to log changes
CREATE OR REPLACE FUNCTION log_agents_history() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO agents_history 
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
        INSERT INTO agents_history 
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
        INSERT INTO agents_history 
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

-- 6. Create triggers on agents table
CREATE TRIGGER agents_history_insert
AFTER INSERT ON agents
FOR EACH ROW EXECUTE FUNCTION log_agents_history();

CREATE TRIGGER agents_history_update
AFTER UPDATE ON agents
FOR EACH ROW EXECUTE FUNCTION log_agents_history();

CREATE TRIGGER agents_history_delete
AFTER DELETE ON agents
FOR EACH ROW EXECUTE FUNCTION log_agents_history();
