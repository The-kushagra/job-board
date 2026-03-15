// eslint-disable-next-line @typescript-eslint/no-require-imports
let pipelineInstance: any = null

async function getPipeline(): Promise<any> {
  if (!pipelineInstance) {
    // Dynamic import for @xenova/transformers (no TS declarations available)
    const { pipeline } = await import("@xenova/transformers" as any)
    pipelineInstance = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    )
  }
  return pipelineInstance
}

/**
 * Generate a 384-dimension embedding vector for the given text.
 * Uses the Xenova/all-MiniLM-L6-v2 model running locally.
 * Input is truncated to ~512 tokens (approx 2000 chars) to stay within model limits.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Rough truncation: ~4 chars per token, 512 tokens ≈ 2048 chars
  const truncated = text.slice(0, 2048)

  const pipe = await getPipeline()
  const output = await pipe(truncated, {
    pooling: "mean",
    normalize: true,
  })

  // output.data is a Float32Array — convert to regular array
  return Array.from(output.data as Float32Array)
}
