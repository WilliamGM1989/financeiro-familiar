'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createGoal } from '@/app/(app)/actions/goals'

const S = {
  label: { color: '#7a9bb5', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 } as React.CSSProperties,
  input: {
    width: '100%', background: 'rgba(0,214,143,0.05)', border: '1px solid rgba(0,214,143,0.12)', borderRadius: 12,
    padding: '10px 14px', color: '#e8f4f0', fontSize: 14, outline: 'none',
  } as React.CSSProperties,
}

export default function NovaMetaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const result = await createGoal(fd)
    setLoading(false)
    if ('error' in result) { setError(result.error ?? 'Erro desconhecido') } else { router.push('/cadastros') }
  }

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(180deg,#06090f 0%,#0d1520 100%)', borderBottom: '1px solid rgba(0,214,143,0.15)' }}>
        <Link href="/cadastros"
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,214,143,0.05)', border: '1px solid rgba(0,214,143,0.12)' }}>
          <svg className="w-5 h-5" fill="none" stroke="#8b949e" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 style={{ color: '#e8f4f0', fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
            Nova Meta
          </h1>
          <p style={{ color: '#7a9bb5', fontSize: 11, marginTop: 1 }}>Defina um objetivo financeiro</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5 pb-32">

        {/* Nome */}
        <div>
          <label style={S.label}>Nome da meta *</label>
          <input name="name" type="text" required placeholder="Ex: Viagem, Carro, Reserva de emergência"
            style={S.input} />
        </div>

        {/* Valor alvo */}
        <div>
          <label style={S.label}>Valor alvo (R$) *</label>
          <input name="target_amount" type="number" step="0.01" min="0.01" required
            placeholder="0,00" style={S.input} />
        </div>

        {/* Valor já guardado */}
        <div>
          <label style={S.label}>Quanto já guardou? (R$)</label>
          <input name="current_amount" type="number" step="0.01" min="0" defaultValue="0"
            style={S.input} />
          <p style={{ color: '#4a6a7a', fontSize: 11, marginTop: 5 }}>Deixe 0 se ainda não começou</p>
        </div>

        {/* Prazo */}
        <div>
          <label style={S.label}>Prazo (opcional)</label>
          <input name="deadline" type="date" style={S.input} />
        </div>

        {error && (
          <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ color: '#f85149', fontSize: 13 }}>{error}</p>
          </div>
        )}

        {/* Info */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}>
          <p style={{ color: '#38bdf8', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Como funciona?</p>
          <p style={{ color: '#7a9bb5', fontSize: 12, lineHeight: 1.6 }}>
            Após criar, você poderá registrar valores guardados para acompanhar seu progresso na tela de Cadastros.
          </p>
        </div>

        {/* Botão fixo */}
        <div className="fixed bottom-20 left-0 right-0 px-5 pt-3 pb-3"
          style={{ background: 'rgba(13,17,23,0.95)', borderTop: '1px solid #30363d', backdropFilter: 'blur(8px)' }}>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-2xl text-sm font-semibold"
            style={{ background: '#00d68f', color: '#fff', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Criando...' : 'Criar meta'}
          </button>
        </div>
      </form>
    </div>
  )
}
