// ─── LLM API Service (Ollama + Groq) ──────────────────────────────────────────
// Supports both local Ollama and cloud Groq APIs.

import { LLMConfig } from './configStore'

// ── Ollama ────────────────────────────────────────────────────────────────────

export interface OllamaConfig {
  apiUrl: string  // e.g. http://localhost:11434
  model: string
}

/**
 * Test that Ollama is reachable by listing available models.
 */
export async function testOllamaConnection(apiUrl: string): Promise<string[]> {
  const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/tags`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json'
    },
  })
  if (!res.ok) throw new Error(`Ollama responded with HTTP ${res.status}`)
  const data = await res.json()
  return (data.models || []).map((m: any) => m.name as string)
}

/**
 * Send a prompt to Ollama and return the response text.
 */
export async function generateWithOllama(config: OllamaConfig, prompt: string): Promise<string> {
  const base = config.apiUrl.replace(/\/$/, '')
  const res = await fetch(`${base}/api/generate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
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

// ── Groq ──────────────────────────────────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1'

/**
 * Test Groq connection by listing available models.
 */
export async function testGroqConnection(apiKey: string): Promise<string[]> {
  const res = await fetch(`${GROQ_API_URL}/models`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Groq responded with HTTP ${res.status}: ${errText}`)
  }
  const data = await res.json()
  return (data.data || []).map((m: any) => m.id as string).sort()
}

/**
 * Send a prompt to Groq and return the response text.
 */
export async function generateWithGroq(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Groq error (${res.status}): ${errText}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ── Unified generate function ─────────────────────────────────────────────────

/**
 * Generate text using whatever provider is configured.
 */
export async function generateWithLLM(config: LLMConfig, prompt: string): Promise<string> {
  if (config.provider === 'groq') {
    if (!config.apiKey) throw new Error('Groq API key is required.')
    return generateWithGroq(config.apiKey, config.model, prompt)
  }
  // Default: Ollama
  return generateWithOllama({ apiUrl: config.apiUrl, model: config.model }, prompt)
}
