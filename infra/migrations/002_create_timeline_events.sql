CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  ts BIGINT NOT NULL,
  modality TEXT NOT NULL,
  subtype TEXT NOT NULL,
  payload JSONB NOT NULL,
  correlation_ids TEXT[],
  css_blocker_state JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_timeline_events_session_ts ON timeline_events (session_id, ts);
CREATE INDEX idx_timeline_events_session_modality ON timeline_events (session_id, modality);
CREATE INDEX idx_timeline_events_modality ON timeline_events (modality);
