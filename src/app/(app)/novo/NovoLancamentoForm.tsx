'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createTransaction } from '@/app/(app)/actions/transactions'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['Gestao_FamiliarWillcategories']['Row']
type AccountRow = Database['public']['Tables']['Gestao_FamiliarWillaccounts']['Row']

interface Props {
  categories: CategoryRow[]
  accounts: AccountRow[]
}

const today = () => new Date().toISOString().split('T')[0]

export default function NovoLancamentoForm({ categories, accounts }: Props) {
  const router = useRouter()
  const [tipo, setTipo] = useState<'income' | 'expense'>('expense')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const visibleCategories = tipo === 'income' ? incomeCategories : expenseCategories

  // ── Scanner de Comprovante ──────────────────────────────────────────────────
  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    setError(null)
    setScanSuccess(false)

    try {
      // Converter para base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1]) // remover "data:image/...;base64,"
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'

      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao processar')

      // Preencher formulário com dados extraídos
      const form = formRef.current
      if (!form) return

      const setField = (name: string, value: string) => {
        const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null
        if (el) {
          el.value = value
          el.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }

      setField('description', data.description ?? '')
      setField('amount', data.amount ?? '')
      setField('date', data.date ?? today())
      setField('notes', data.notes ?? '')

      if (data.type === 'income') setTipo('income')
      else setTipo('expense')

      setScanSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao escanear. Tente uma foto mais nítida.')
    } finally {
      setScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('type', tipo)

    const result = await createTransaction(formData)

    setLoading(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      router.push('/lancamentos')
    }
  }

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
  const inputCls =
    'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4 pb-28">

      {/* ── Scanner Button ─────────────────────────────────────────────────── */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleScan}
          aria-label="Escanear comprovante"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed transition"
          style={{
            borderColor: scanSuccess ? '#10b981' : '#064E3B',
            background: scanSuccess ? 'rgba(16,185,129,0.06)' : 'rgba(6,78,59,0.04)',
            color: scanSuccess ? '#059669' : '#064E3B',
          }}
        >
          {scanning ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span className="text-sm font-semibold">Analisando comprovante com IA...</span>
            </>
          ) : scanSuccess ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold">Comprovante lido! Toque para escanear outro</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-semibold">Escanear comprovante / nota fiscal</span>
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 text-center mt-1">
          Tire uma foto de talão de luz, nota do posto, recibo, etc.
        </p>
      </div>

      {/* ── Divisor ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">ou preencha manualmente</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* ── Tipo ───────────────────────────────────────────────────────────── */}
      <div>
        <label className={labelCls}>Tipo</label>
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button
            type="button"
            onClick={() => setTipo('expense')}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              tipo === 'expense' ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setTipo('income')}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              tipo === 'income' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Receita
          </button>
        </div>
      </div>

      {/* ── Descrição ──────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="description" className={labelCls}>Descrição</label>
        <input id="description" name="description" type="text" placeholder="Ex: Supermercado" className={inputCls} />
      </div>

      {/* ── Valor ──────────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="amount" className={labelCls}>Valor (R$)</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="0,00" className={inputCls} />
      </div>

      {/* ── Data ───────────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="date" className={labelCls}>Data</label>
        <input id="date" name="date" type="date" required defaultValue={today()} className={inputCls} />
      </div>

      {/* ── Categoria ──────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="category_id" className={labelCls}>Categoria</label>
        <select id="category_id" name="category_id" className={inputCls}>
          <option value="">Sem categoria</option>
          {visibleCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* ── Conta ──────────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="account_id" className={labelCls}>Conta *</label>
        <select id="account_id" name="account_id" required className={inputCls}>
          <option value="">Selecione uma conta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* ── Ciclo de Pagamento ─────────────────────────────────────────────── */}
      <div>
        <label htmlFor="payment_cycle" className={labelCls}>Ciclo de Pagamento</label>
        <select id="payment_cycle" name="payment_cycle" className={inputCls}>
          <option value="">Nenhum</option>
          <option value="dia05">Pagamento do Casal (Dia 05)</option>
          <option value="dia20">Vale do Casal (Dia 20)</option>
        </select>
      </div>

      {/* ── Pago ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <input id="paid" name="paid" type="checkbox" value="true" className="w-4 h-4 accent-[#064E3B]" />
        <label htmlFor="paid" className="text-sm text-gray-700">
          {tipo === 'income' ? 'Recebido' : 'Pago'}
        </label>
      </div>

      {/* ── Observações ────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="notes" className={labelCls}>Observações (opcional)</label>
        <textarea id="notes" name="notes" rows={3} placeholder="Notas adicionais..." className={`${inputCls} resize-none`} />
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* ── Botão Salvar ───────────────────────────────────────────────────── */}
      <div className="fixed bottom-20 left-0 right-0 px-6 bg-white/90 backdrop-blur-sm pt-3 pb-3 border-t border-gray-100 max-w-lg mx-auto">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#064E3B] text-white font-semibold py-3 rounded-2xl text-sm hover:bg-emerald-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
