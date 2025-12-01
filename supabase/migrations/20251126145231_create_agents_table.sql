CREATE TABLE IF NOT EXISTS agents (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  instruction text not null,
  model text,
  schema_output jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON agents TO authenticated;
GRANT ALL ON agents TO service_role;