
-- Function to recalculate and sync match stats for a given player
CREATE OR REPLACE FUNCTION recalculate_player_stats(player_uuid UUID)
RETURNS VOID AS $$
DECLARE
  played_count INTEGER;
  won_count    INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO played_count
  FROM match_results mr
  JOIN matches m ON mr.match_id = m.id
  WHERE mr.status = 'approved'
    AND (m.player1_id = player_uuid OR m.player2_id = player_uuid);

  SELECT COUNT(*)
  INTO won_count
  FROM match_results mr
  WHERE mr.status = 'approved'
    AND mr.winner_id = player_uuid;

  UPDATE profiles
  SET
    matches_played = played_count,
    matches_won    = won_count,
    matches_lost   = played_count - won_count
  WHERE id = player_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: fires after any INSERT/UPDATE on match_results
CREATE OR REPLACE FUNCTION trigger_sync_match_stats()
RETURNS TRIGGER AS $$
DECLARE
  p1 UUID;
  p2 UUID;
BEGIN
  -- Determine which row we are operating on
  IF TG_OP = 'DELETE' THEN
    SELECT player1_id, player2_id INTO p1, p2 FROM matches WHERE id = OLD.match_id;
    PERFORM recalculate_player_stats(p1);
    PERFORM recalculate_player_stats(p2);
    RETURN OLD;
  ELSE
    SELECT player1_id, player2_id INTO p1, p2 FROM matches WHERE id = NEW.match_id;
    PERFORM recalculate_player_stats(p1);
    PERFORM recalculate_player_stats(p2);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to match_results
DROP TRIGGER IF EXISTS sync_match_stats_on_result ON match_results;
CREATE TRIGGER sync_match_stats_on_result
  AFTER INSERT OR UPDATE OR DELETE ON match_results
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_match_stats();

-- Backfill: recalculate stats for every player involved in any match result
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT DISTINCT unnest(ARRAY[m.player1_id, m.player2_id]) AS player_id
    FROM match_results mr
    JOIN matches m ON mr.match_id = m.id
  LOOP
    PERFORM recalculate_player_stats(rec.player_id);
  END LOOP;
END;
$$;
