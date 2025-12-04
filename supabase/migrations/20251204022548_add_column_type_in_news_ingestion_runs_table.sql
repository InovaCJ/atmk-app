ALTER TABLE news_ingestion_runs
ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'manual';