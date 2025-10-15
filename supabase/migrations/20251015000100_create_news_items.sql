-- Migration: Create news_items table for aggregated news/articles per client
-- Description: Stores normalized items from RSS/external feeds with 90-day retention supported elsewhere

CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES news_sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  author TEXT,
  summary TEXT,
  content TEXT,
  topics JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT news_items_client_urlhash_unique UNIQUE (client_id, url_hash)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_items_client_active_published ON news_items (client_id, is_active, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_source_id ON news_items (source_id);

-- Enable RLS and add policies consistent with multi-tenant model
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Client members can view news items" ON news_items
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_members WHERE user_id = auth.uid()
    ) OR client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Client editors and admins can manage news items" ON news_items
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR client_id IN (
      SELECT client_id FROM client_members 
      WHERE user_id = auth.uid() AND role IN ('client_admin', 'editor')
    )
  );

COMMENT ON TABLE news_items IS 'Normalized news/articles aggregated from client news_sources';
COMMENT ON COLUMN news_items.topics IS 'Array with extracted topics/keywords for the item';
COMMENT ON CONSTRAINT news_items_client_urlhash_unique ON news_items IS 'Deduplication per client via URL hash';


