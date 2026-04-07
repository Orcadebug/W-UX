CREATE TABLE IF NOT EXISTS intent_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  hypothesis_id UUID NOT NULL REFERENCES hypotheses(id) ON DELETE CASCADE,
  user_intent TEXT NOT NULL,
  observed_outcome TEXT NOT NULL,
  blocking_condition TEXT NOT NULL,
  likely_root_cause TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_intent_gaps_session ON intent_gaps (session_id);
CREATE INDEX idx_intent_gaps_hypothesis ON intent_gaps (hypothesis_id);
