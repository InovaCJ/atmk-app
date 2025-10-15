-- Migration: Add Search Configuration to Client Settings
-- Description: Adds fields to store search terms and frequencies in client_settings table

-- Add search configuration fields to client_settings table
ALTER TABLE client_settings 
ADD COLUMN search_terms JSONB DEFAULT '[]'::jsonb,
ADD COLUMN search_frequencies JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN client_settings.search_terms IS 'Array of search terms configured by the client for automated news search';
COMMENT ON COLUMN client_settings.search_frequencies IS 'Array of search frequencies (daily, weekly, monthly) with enabled status';

-- Create index for better performance on search queries
CREATE INDEX idx_client_settings_search_config ON client_settings(client_id) WHERE search_terms IS NOT NULL OR search_frequencies IS NOT NULL;

-- Update existing client_settings records with default search configuration
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
