CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_version TEXT NOT NULL,
  user_id TEXT,
  started_at BIGINT NOT NULL,
  ended_at BIGINT,
  device JSONB NOT NULL,
  environment JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessions_started_at ON sessions (started_at);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);
