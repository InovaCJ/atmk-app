-- Sync news_items.is_active when a news_source is (de)activated

CREATE OR REPLACE FUNCTION sync_news_items_on_source_toggle()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.enabled IS DISTINCT FROM OLD.enabled THEN
    UPDATE news_items SET is_active = NEW.enabled, updated_at = NOW()
    WHERE source_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_news_items_on_source_toggle ON news_sources;
CREATE TRIGGER trg_sync_news_items_on_source_toggle
AFTER UPDATE ON news_sources
FOR EACH ROW
EXECUTE FUNCTION sync_news_items_on_source_toggle();


