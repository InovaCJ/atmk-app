-- RPC to delete news_items older than cutoff

CREATE OR REPLACE FUNCTION delete_old_news_items(cutoff_ts TIMESTAMPTZ)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM news_items WHERE published_at IS NOT NULL AND published_at < cutoff_ts;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_old_news_items IS 'Deletes news_items older than a given timestamp (retention)';


