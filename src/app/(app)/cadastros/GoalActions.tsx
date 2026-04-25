'use client'

import { useState } from 'react'
import { deleteGoal, updateGoalProgress } from '@/app/(app)/actions/goals'

interface Props {
  id: string
  name: string
  current: number
  target: number
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function GoalActions({ id, name, current, target }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDone = current >= target

  async function handleAddProgress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const result = await updateGoalProgress(id, fd)
    setLoading(false)
    if ('error' in result) { setError(result.error ?? 'Erro desconhecido') } else { setShowAdd(false) }
  }

  async function handleDelete() {
    if (!confirm(`Excluir a meta "${name}"?`)) return
    setDeleting(true)
    await deleteGoal(id)
    setDeleting(false)
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        {!isDone && (
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="p-2 rounded-lg transition"
            style={{ color: '#00d68f', background: showAdd ? 'rgba(0,214,143,0.1)' : 'transparent' }}
            aria-label="Adicionar valor"
            title="Adicionar valor guardado"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 rounded-lg transition"
          style={{ color: '#f85149' }}
          aria-label="Excluir meta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Inline form to add progress */}
      {showAdd && (
        <form
          onSubmit={handleAddProgress}
          className="mt-3 rounded-xl overflow-hidden"
          style={{ background: 'rgba(0,214,143,0.05)', border: '1px solid rgba(0,214,143,0.12)' }}
        >
          <div className="px-3 py-2 flex items-center gap-2">
            <div style={{ flex: 1 }}>
              <p style={{ color: '#7a9bb5', fontSize: 10, marginBottom: 4 }}>
                Faltam {fmt(Math.max(0, target - current))}
              </p>
              <input
                name="add_amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Valor guardado (R$)"
                style={{
                  width: '100%', background: 'rgba(13,21,32,0.97)', border: '1px solid rgba(0,214,143,0.12)',
                  borderRadius: 8, padding: '6px 10px', color: '#e8f4f0', fontSize: 13, outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold shrink-0"
              style={{ background: '#00d68f', color: '#fff', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '...' : 'Salvar'}
            </button>
          </div>
          {error && (
            <p style={{ color: '#f85149', fontSize: 11, padding: '0 12px 8px' }}>{error}</p>
          )}
        </form>
      )}
    </div>
  )
}
