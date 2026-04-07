CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS semantic_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  start_ts BIGINT NOT NULL,
  end_ts BIGINT NOT NULL,
  modalities TEXT[] NOT NULL,
  summary TEXT NOT NULL,
  tokens TEXT[] NOT NULL,
  embedding_id TEXT,
  evidence_ids TEXT[] NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_semantic_chunks_session ON semantic_chunks (session_id);
CREATE INDEX idx_semantic_chunks_embedding ON semantic_chunks USING ivfflat (embedding vector_cosine_ops);
