import OpenAI from 'openai'
import type { SemanticChunk } from '@w-ux/shared-types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  
  return response.data[0].embedding
}

export async function embedChunk(chunk: SemanticChunk): Promise<SemanticChunk> {
  const embedding = await generateEmbedding(chunk.summary)
  return {
    ...chunk,
    embeddingId: `emb-${chunk.id}`,
  }
}