'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTransaction } from '@/app/(app)/actions/transactions'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']
type AccountRow = Database['public']['Tables']['accounts']['Row']

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

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const visibleCategories = tipo === 'income' ? incomeCategories : expenseCategories

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4 pb-28">
      {/* Tipo toggle */}
      <div>
        <label className={labelCls}>Tipo</label>
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button
            type="button"
            onClick={() => setTipo('expense')}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              tipo === 'expense'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setTipo('income')}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              tipo === 'income'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Receita
          </button>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className={labelCls}>Descrição</label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="Ex: Supermercado"
          className={inputCls}
        />
      </div>

      {/* Valor */}
      <div>
        <label htmlFor="amount" className={labelCls}>Valor (R$)</label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0,00"
          className={inputCls}
        />
      </div>

      {/* Data */}
      <div>
        <label htmlFor="date" className={labelCls}>Data</label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={today()}
          className={inputCls}
        />
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor="category_id" className={labelCls}>Categoria</label>
        <select id="category_id" name="category_id" className={inputCls}>
          <option value="">Sem categoria</option>
          {visibleCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Conta */}
      <div>
        <label htmlFor="account_id" className={labelCls}>Conta *</label>
        <select id="account_id" name="account_id" required className={inputCls}>
          <option value="">Selecione uma conta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pago */}
      <div className="flex items-center gap-3">
        <input
          id="paid"
          name="paid"
          type="checkbox"
          value="true"
          className="w-4 h-4 accent-[#064E3B]"
        />
        <label htmlFor="paid" className="text-sm text-gray-700">
          {tipo === 'income' ? 'Recebido' : 'Pago'}
        </label>
      </div>

      {/* Observações */}
      <div>
        <label htmlFor="notes" className={labelCls}>Observações (opcional)</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Notas adicionais..."
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Fixed bottom save button */}
      <div className="fixed bottom-20 left-0 right-0 px-6 bg-white/90 backdrop-blur-sm pt-3 pb-3 border-t border-gray-100">
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
