// ─── localStorage Config Store (Ollama + Groq) ───────────────────────────────
// No backend required. All configs persisted in the browser.

const STORAGE_KEY = 'ce_llm_configs'

export type LLMProvider = 'ollama' | 'groq'

export interface LLMConfig {
  id: string
  name: string
  provider: LLMProvider
  apiUrl: string   // e.g. http://localhost:11434 for Ollama, https://api.groq.com for Groq
  apiKey?: string   // Required for Groq
  model: string    // e.g. llama3 (Ollama) or llama-3.3-70b-versatile (Groq)
  testStatus: 'untested' | 'connected' | 'failed'
  createdAt: string
  lastTestedAt?: string
  testError?: string
}

function readAll(): LLMConfig[] {
  try {
    const configs: LLMConfig[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    // Migrate old configs that don't have provider field
    return configs.map(c => ({ ...c, provider: c.provider || 'ollama' }))
  }
  catch { return [] }
}

function writeAll(configs: LLMConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}

export const configStore = {
  getAll(): LLMConfig[] { return readAll() },

  save(data: { name: string; provider: LLMProvider; apiUrl: string; apiKey?: string; model: string }): LLMConfig {
    const newConfig: LLMConfig = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      testStatus: 'untested',
    }
    writeAll([...readAll(), newConfig])
    return newConfig
  },

  update(id: string, data: { name: string; provider: LLMProvider; apiUrl: string; apiKey?: string; model: string }): boolean {
    const configs = readAll()
    const idx = configs.findIndex(c => c.id === id)
    if (idx === -1) return false
    configs[idx] = { ...configs[idx], ...data }
    writeAll(configs)
    return true
  },

  delete(id: string): void {
    writeAll(readAll().filter(c => c.id !== id))
  },

  setStatus(id: string, status: 'untested' | 'connected' | 'failed', error?: string): void {
    const configs = readAll()
    const idx = configs.findIndex(c => c.id === id)
    if (idx === -1) return
    configs[idx] = {
      ...configs[idx],
      testStatus: status,
      lastTestedAt: new Date().toISOString(),
      testError: error,
    }
    writeAll(configs)
  },
}
