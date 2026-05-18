// ─── Direct Ollama API Service ─────────────────────────────────────────────────
// Calls Ollama at its local URL directly from the browser — no backend proxy needed.
// Requires Ollama to allow browser origins. Set env var:
//   OLLAMA_ORIGINS=* ollama serve
// or on Windows, start Ollama then set: OLLAMA_ORIGINS=*

export interface OllamaConfig {
  apiUrl: string  // e.g. http://localhost:11434
  model: string
}

/**
 * Test that Ollama is reachable by listing available models.
 * Returns the list of model names on success.
 */
export async function testOllamaConnection(apiUrl: string): Promise<string[]> {
  const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/tags`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Ollama responded with HTTP ${res.status}`)
  const data = await res.json()
  // data.models is an array of { name, ... }
  return (data.models || []).map((m: any) => m.name as string)
}

/**
 * Send a prompt to Ollama and return the response text.
 */
export async function generateWithOllama(config: OllamaConfig, prompt: string): Promise<string> {
  const base = config.apiUrl.replace(/\/$/, '')
  const res = await fetch(`${base}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt,
      stream: false,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Ollama error (${res.status}): ${errText}`)
  }
  const data = await res.json()
  return data.response as string
}
