
WITH new_matches AS (
  INSERT INTO matches (tournament_id, player1_id, player2_id, round_number, match_number, status, result_submitted, result_approved)
  VALUES
    ('6ddf1801-52b1-4c93-8ba0-855858a074a1', '6d229bc8-892b-4739-94bd-1d84618d7309', '86e8b14a-9391-4741-81c3-d300ee25b61c', 1, 10, 'completed', true, true),
    ('6ddf1801-52b1-4c93-8ba0-855858a074a1', '3d3bc47e-3542-4e38-adc9-5f6ce9edc642', '6d229bc8-892b-4739-94bd-1d84618d7309', 1, 11, 'completed', true, true),
    ('6ddf1801-52b1-4c93-8ba0-855858a074a1', '6d229bc8-892b-4739-94bd-1d84618d7309', '2f1125f4-877b-4d55-a2fd-19bf00b79b55', 1, 12, 'completed', true, true),
    ('b1d5e471-9794-4afe-8824-1d995e649fdc', '96bfb954-5005-402b-9a13-e80901c76e73', '6d229bc8-892b-4739-94bd-1d84618d7309', 1, 13, 'completed', true, true),
    ('b1d5e471-9794-4afe-8824-1d995e649fdc', '6d229bc8-892b-4739-94bd-1d84618d7309', '6aa8366b-1f0b-4dba-a190-eeeddb117e40', 1, 14, 'completed', true, true),
    ('b1d5e471-9794-4afe-8824-1d995e649fdc', '8f726f72-d6dc-4c39-88f2-fe3dcea37f27', '6d229bc8-892b-4739-94bd-1d84618d7309', 1, 15, 'completed', true, true),
    ('63b741a9-4b52-4839-b303-46f3c283d471', '6d229bc8-892b-4739-94bd-1d84618d7309', '98002566-3eff-4324-8a7e-f6dedf608344', 1, 16, 'completed', true, true),
    ('63b741a9-4b52-4839-b303-46f3c283d471', '922e1671-59b2-451c-8f35-1539540a9db4', '6d229bc8-892b-4739-94bd-1d84618d7309', 1, 17, 'completed', true, true),
    ('63b741a9-4b52-4839-b303-46f3c283d471', '6d229bc8-892b-4739-94bd-1d84618d7309', '8ae1b38e-c3b2-4d90-9b59-6d26b43b61d9', 1, 18, 'completed', true, true),
    ('6ddf1801-52b1-4c93-8ba0-855858a074a1', '86e8b14a-9391-4741-81c3-d300ee25b61c', '6d229bc8-892b-4739-94bd-1d84618d7309', 1, 19, 'completed', true, true),
    ('b1d5e471-9794-4afe-8824-1d995e649fdc', '6d229bc8-892b-4739-94bd-1d84618d7309', '3d3bc47e-3542-4e38-adc9-5f6ce9edc642', 1, 20, 'completed', true, true),
    ('63b741a9-4b52-4839-b303-46f3c283d471', '2f1125f4-877b-4d55-a2fd-19bf00b79b55', '6d229bc8-892b-4739-94bd-1d84618d7309', 1, 21, 'completed', true, true),
    ('6ddf1801-52b1-4c93-8ba0-855858a074a1', '6d229bc8-892b-4739-94bd-1d84618d7309', '96bfb954-5005-402b-9a13-e80901c76e73', 1, 22, 'completed', true, true)
  RETURNING id, player1_id, player2_id
),
numbered_matches AS (
  SELECT nm.*, ROW_NUMBER() OVER () AS rn
  FROM new_matches nm
)
INSERT INTO match_results (match_id, submitted_by, player1_score, player2_score, winner_id, status, player1_set1_score, player1_set2_score, player1_set3_score, player2_set1_score, player2_set2_score, player2_set3_score, date_completed, reviewed_at)
SELECT
  nm.id,
  nm.player1_id,
  CASE WHEN nm.rn % 3 = 0 THEN 1 ELSE 2 END,
  CASE WHEN nm.rn % 3 = 0 THEN 2 ELSE 1 END,
  CASE
    WHEN nm.rn % 3 = 0 THEN
      CASE WHEN nm.player1_id = '6d229bc8-892b-4739-94bd-1d84618d7309' THEN nm.player2_id ELSE nm.player1_id END
    ELSE
      CASE WHEN nm.player1_id = '6d229bc8-892b-4739-94bd-1d84618d7309' THEN nm.player1_id ELSE nm.player2_id END
  END,
  'approved',
  CASE WHEN nm.rn % 3 = 0 THEN 4 ELSE 11 END,
  CASE WHEN nm.rn % 3 = 0 THEN 7 ELSE 11 END,
  NULL,
  CASE WHEN nm.rn % 3 = 0 THEN 11 ELSE 4 END,
  CASE WHEN nm.rn % 3 = 0 THEN 11 ELSE 7 END,
  NULL,
  (CURRENT_DATE - ((nm.rn * 7 + 15) || ' days')::interval)::date,
  now()
FROM numbered_matches nm;
