CREATE TABLE IF NOT EXISTS predictions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id      UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    home_win_prob FLOAT NOT NULL,
    draw_prob     FLOAT NOT NULL,
    away_win_prob FLOAT NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    latency_ms    FLOAT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
