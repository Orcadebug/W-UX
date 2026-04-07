CREATE TABLE IF NOT EXISTS hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  evidence_ids TEXT[] NOT NULL,
  suspected_files TEXT[],
  suspected_components TEXT[],
  verifier_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_hypotheses_session ON hypotheses (session_id);
CREATE INDEX idx_hypotheses_category ON hypotheses (category);
CREATE INDEX idx_hypotheses_confidence ON hypotheses (confidence DESC);
