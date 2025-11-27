-- Migration: Create news_ingestion_runs for ingestion observability/telemetry

CREATE TABLE IF NOT EXISTS news_ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  source_id UUID REFERENCES news_sources(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'success', -- success | partial | error
  items_fetched INTEGER DEFAULT 0,
  items_inserted INTEGER DEFAULT 0,
  items_skipped INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_news_ingestion_runs_client_started ON news_ingestion_runs (client_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_ingestion_runs_source_started ON news_ingestion_runs (source_id, started_at DESC);

ALTER TABLE news_ingestion_runs ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON news_ingestion_runs TO authenticated;
GRANT ALL ON news_ingestion_runs TO service_role;

DROP POLICY IF EXISTS "Client members can view ingestion runs" ON news_ingestion_runs;
CREATE POLICY "Client members can view ingestion runs" ON news_ingestion_runs
  FOR SELECT USING (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (SELECT get_member_client_ids())
  );

DROP POLICY IF EXISTS "Client admins and owners can insert ingestion runs" ON news_ingestion_runs;
CREATE POLICY "Client admins and owners can insert ingestion runs" ON news_ingestion_runs
  FOR INSERT WITH CHECK (
    client_id IN (SELECT get_owned_clients())
    OR
    client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role = 'client_admin'
    )
  );

COMMENT ON TABLE news_ingestion_runs IS 'Telemetry of news ingestion executions per client/source';