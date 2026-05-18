import React, { useState, useEffect } from 'react'
import { Save, Edit2, Trash2, CheckCircle, AlertCircle, Settings, RefreshCw, XCircle, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { configStore, LLMConfig } from '../services/configStore'
import { testOllamaConnection } from '../services/llmService'

const DEFAULT_URL = 'http://localhost:11434'
const COMMON_MODELS = ['llama3', 'llama3.1', 'llama3.2', 'llama2', 'mistral', 'neural-chat', 'qwen2.5', 'phi3', 'gemma2']

const LLMConfiguration: React.FC = () => {
  const [configs, setConfigs]             = useState<LLMConfig[]>([])
  const [errorModal, setErrorModal]       = useState<{ title: string; detail: string } | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [loading, setLoading]             = useState(false)
  const [testing, setTesting]             = useState(false)
  const [fetchedModels, setFetchedModels] = useState<string[]>([])

  const [formData, setFormData] = useState({ name: '', apiUrl: DEFAULT_URL, model: 'llama3' })

  const refresh = () => setConfigs(configStore.getAll())

  useEffect(() => { refresh() }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Fetches installed models — only auto-selects if current model isn't installed
  const handleFetchModels = async () => {
    setTesting(true)
    try {
      const models = await testOllamaConnection(formData.apiUrl)
      setFetchedModels(models)
      if (models.length > 0) {
        // Only auto-change the model if what the user has typed isn't in the list
        const currentIsAvailable = models.some(
          m => m.toLowerCase().includes(formData.model.toLowerCase()) ||
               formData.model.toLowerCase().includes(m.split(':')[0].toLowerCase())
        )
        if (!currentIsAvailable) {
          setFormData(prev => ({ ...prev, model: models[0] }))
          toast.success(`Found ${models.length} model(s). Auto-selected: ${models[0]}`)
        } else {
          toast.success(`Found ${models.length} model(s) on Ollama — your selection is available ✓`)
        }
      } else {
        toast('Ollama connected but no models are installed yet.', { icon: '⚠️' })
      }
    } catch (e: any) {
      setErrorModal({
        title: 'Connection Failed',
        detail: `Could not reach Ollama at ${formData.apiUrl}.\n\n` +
          `Make sure Ollama is running and CORS is enabled:\n` +
          `  Windows: set OLLAMA_ORIGINS=* in your environment, then restart Ollama\n` +
          `  macOS/Linux: OLLAMA_ORIGINS=* ollama serve\n\n` +
          `Error: ${e.message}`,
      })
    } finally { setTesting(false) }
  }

  // Test only — NEVER changes the model selection
  const handleTestOnly = async () => {
    setTesting(true)
    try {
      const models = await testOllamaConnection(formData.apiUrl)
      toast.success(`Ollama is reachable! ${models.length} model(s) installed.`)
    } catch (e: any) {
      setErrorModal({
        title: 'Connection Failed',
        detail: `Could not reach Ollama at ${formData.apiUrl}.\n\nError: ${e.message}`,
      })
    } finally { setTesting(false) }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Please enter a configuration name.'); return }
    if (!formData.apiUrl.trim()) { toast.error('Please enter the Ollama URL.'); return }
    if (!formData.model.trim()) { toast.error('Please select or type a model.'); return }
    setLoading(true)
    try {
      if (editingId) {
        configStore.update(editingId, formData)
        toast.success('Configuration updated!')
      } else {
        configStore.save(formData)
        toast.success('Configuration saved!')
      }
      refresh()
      resetForm()
    } finally { setLoading(false) }
  }

  const handleEdit = (c: LLMConfig) => {
    setEditingId(c.id)
    setFormData({ name: c.name, apiUrl: c.apiUrl, model: c.model })
  }

  const confirmDelete = () => {
    if (!deleteConfirmId) return
    configStore.delete(deleteConfirmId)
    toast.success('Configuration deleted.')
    setDeleteConfirmId(null)
    refresh()
  }

  const resetForm = () => {
    setFormData({ name: '', apiUrl: DEFAULT_URL, model: 'llama3' })
    setEditingId(null)
    setFetchedModels([])
  }

  const modelOptions = fetchedModels.length > 0 ? fetchedModels : COMMON_MODELS

  const getStatusBadge = (status: string) => {
    if (status === 'connected') return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
        <CheckCircle size={14} className="mr-1" /> Connected
      </span>
    )
    if (status === 'failed') return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <AlertCircle size={14} className="mr-1" /> Failed
      </span>
    )
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">Untested</span>
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* ── CORS Info Banner ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 flex items-start gap-3">
          <span className="text-amber-500 text-xl mt-0.5">⚡</span>
          <div>
            <p className="text-sm font-black text-amber-800">Ollama CORS Required</p>
            <p className="text-xs text-amber-700 mt-1">
              For browser-direct calls to work, start Ollama with:{' '}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">OLLAMA_ORIGINS=* ollama serve</code>
              {' '}(or set the env var in Windows before starting Ollama).
            </p>
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-10 pb-0 flex items-start space-x-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0f172a]">Ollama Configuration</h1>
              <p className="text-slate-500 mt-1 font-medium">
                {editingId ? 'Edit your Ollama connection.' : 'Add your local Ollama instance to power the card generator.'}
              </p>
            </div>
          </div>

          <div className="p-12 space-y-8">
            {/* Name */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 tracking-widest uppercase">Configuration Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInput}
                placeholder="e.g. Local Ollama"
                className="w-full h-16 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none" />
            </div>

            {/* URL + Model row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 tracking-widest uppercase">Ollama URL</label>
                <input type="text" name="apiUrl" value={formData.apiUrl} onChange={handleInput}
                  placeholder="http://localhost:11434"
                  className="w-full h-16 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-400 tracking-widest uppercase">Model</label>
                  <button onClick={handleFetchModels} disabled={testing}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50">
                    <RefreshCw size={11} className={testing ? 'animate-spin' : ''} />
                    Fetch installed models
                  </button>
                </div>

                {/* Dropdown — shown after fetch */}
                {fetchedModels.length > 0 && (
                  <div className="relative">
                    <select name="model" value={formData.model} onChange={handleInput}
                      className="w-full h-16 px-6 bg-slate-50 border-2 border-emerald-200 rounded-2xl text-slate-700 font-bold focus:border-emerald-500 appearance-none outline-none">
                      {fetchedModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}

                {/* Always-visible text input so user can type any model name */}
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInput}
                  placeholder="e.g. llama3, qwen2.5, mistral"
                  className="w-full h-16 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  {fetchedModels.length > 0
                    ? `${fetchedModels.length} models fetched — select above or type below`
                    : 'Type a model name, or click "Fetch installed models" to see what\'s on your Ollama'}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-4 pt-4">
              <button onClick={handleTestOnly} disabled={testing}
                className="flex-1 h-14 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center space-x-3">
                <RefreshCw size={20} className={testing ? 'animate-spin' : ''} />
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>
              <button onClick={handleSave} disabled={loading}
                className="flex-1 h-14 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 flex items-center justify-center space-x-3">
                <Save size={20} />
                <span>{editingId ? 'Update Connection' : 'Save Connection'}</span>
              </button>
              {editingId && (
                <button onClick={resetForm}
                  className="h-14 px-6 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Saved Configs ── */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-3 px-4">
            <span className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-sm shadow-sm">
              {configs.length}
            </span>
            <span>Saved Ollama Connections</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {configs.map((config, index) => (
              <div key={config.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs bg-emerald-50 text-emerald-600">
                      OLL
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-slate-900">{config.name}</h3>
                        {index === 0 && (
                          <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-400">{config.model} · {config.apiUrl}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => handleEdit(config)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirmId(config.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-slate-50 flex items-center justify-between">
                  {getStatusBadge(config.testStatus)}
                  {config.lastTestedAt && (
                    <span className="text-[10px] text-slate-400">
                      Last tested {new Date(config.lastTestedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {configs.length === 0 && (
              <div className="md:col-span-2 p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
                <p className="text-slate-400 font-bold italic">No Ollama connections saved yet. Add one above!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Delete Connection?</h2>
              <p className="text-slate-500 font-medium mb-8">This will remove the saved Ollama config. This action cannot be undone.</p>
              <div className="flex space-x-4">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 h-14 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 h-14 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all">Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error Modal ── */}
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setErrorModal(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-red-500 to-rose-500" />
            <div className="p-10">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center flex-shrink-0">
                  <XCircle size={32} className="text-red-500" />
                </div>
                <div className="pt-1">
                  <h2 className="text-xl font-black text-slate-900">{errorModal.title}</h2>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Ollama Configuration · Error</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8">
                <p className="text-sm font-bold text-red-700 leading-relaxed whitespace-pre-line">{errorModal.detail}</p>
              </div>
              <button onClick={() => setErrorModal(null)}
                className="w-full h-12 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LLMConfiguration
