// ─── localStorage Config Store (Ollama Only) ──────────────────────────────────
// No backend required. All configs persisted in the browser.

const STORAGE_KEY = 'ce_llm_configs'

export interface LLMConfig {
  id: string
  name: string
  apiUrl: string   // e.g. http://localhost:11434
  model: string    // e.g. llama3
  testStatus: 'untested' | 'connected' | 'failed'
  createdAt: string
  lastTestedAt?: string
  testError?: string
}

function readAll(): LLMConfig[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function writeAll(configs: LLMConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}

export const configStore = {
  getAll(): LLMConfig[] { return readAll() },

  save(data: { name: string; apiUrl: string; model: string }): LLMConfig {
    const newConfig: LLMConfig = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      testStatus: 'untested',
    }
    writeAll([...readAll(), newConfig])
    return newConfig
  },

  update(id: string, data: { name: string; apiUrl: string; model: string }): boolean {
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
