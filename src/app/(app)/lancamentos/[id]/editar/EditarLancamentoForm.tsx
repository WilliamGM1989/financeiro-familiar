'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTransaction, deleteTransaction } from '@/app/(app)/actions/transactions'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['Gestao_FamiliarWillcategories']['Row']
type AccountRow  = Database['public']['Tables']['Gestao_FamiliarWillaccounts']['Row']
type TransactionRow = Database['public']['Tables']['Gestao_FamiliarWilltransactions']['Row']

interface Props {
  transaction: TransactionRow
  categories: CategoryRow[]
  accounts: AccountRow[]
}

const S = {
  label: { color: '#7a9bb5', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 } as React.CSSProperties,
  input: {
    width: '100%', background: 'rgba(0,214,143,0.04)', border: '1px solid rgba(0,214,143,0.15)', borderRadius: 12,
    padding: '10px 14px', color: '#e8f4f0', fontSize: 14, outline: 'none',
  } as React.CSSProperties,
}

export default function EditarLancamentoForm({ transaction, categories, accounts }: Props) {
  const router = useRouter()
  const [tipo, setTipo] = useState<'income' | 'expense'>(
    transaction.type === 'income' ? 'income' : 'expense'
  )
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const visibleCategories = categories.filter((c) => c.type === tipo)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set('type', tipo)
    const result = await updateTransaction(transaction.id, fd)
    setLoading(false)
    if ('error' in result) { setError(result.error) } else { router.push('/lancamentos') }
  }

  async function handleDelete() {
    if (!confirm('Excluir este lançamento?')) return
    setDeleting(true)
    const result = await deleteTransaction(transaction.id)
    setDeleting(false)
    if ('error' in result) { setError(result.error) } else { router.push('/lancamentos') }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4 pb-32">

      {/* Tipo */}
      <div>
        <label style={S.label}>Tipo</label>
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #30363d' }}>
          <button type="button" onClick={() => setTipo('expense')}
            className="flex-1 py-2.5 text-sm font-semibold transition"
            style={{ background: tipo === 'expense' ? '#f85149' : '#21262d', color: tipo === 'expense' ? '#fff' : '#8b949e' }}>
            Despesa
          </button>
          <button type="button" onClick={() => setTipo('income')}
            className="flex-1 py-2.5 text-sm font-semibold transition"
            style={{ background: tipo === 'income' ? '#3fb950' : '#21262d', color: tipo === 'income' ? '#fff' : '#8b949e' }}>
            Receita
          </button>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label style={S.label}>Descrição</label>
        <input name="description" type="text" placeholder="Ex: Supermercado"
          defaultValue={transaction.description ?? ''}
          style={S.input} />
      </div>

      {/* Valor */}
      <div>
        <label style={S.label}>Valor (R$)</label>
        <input name="amount" type="number" step="0.01" min="0.01" required
          defaultValue={transaction.amount}
          style={S.input} />
      </div>

      {/* Data */}
      <div>
        <label style={S.label}>Data</label>
        <input name="date" type="date" required
          defaultValue={transaction.date}
          style={S.input} />
      </div>

      {/* Categoria */}
      <div>
        <label style={S.label}>Categoria</label>
        <select name="category_id" style={S.input}>
          <option value="">Sem categoria</option>
          {visibleCategories.map((c) => (
            <option key={c.id} value={c.id} selected={c.id === transaction.category_id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Conta */}
      <div>
        <label style={S.label}>Conta *</label>
        <select name="account_id" required style={S.input}>
          <option value="">Selecione uma conta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id} selected={a.id === transaction.account_id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pago */}
      <div className="flex items-center gap-3 py-1">
        <input id="paid" name="paid" type="checkbox" value="true"
          defaultChecked={transaction.paid ?? false}
          style={{ width: 18, height: 18, accentColor: '#3fb950' }} />
        <label htmlFor="paid" style={{ color: '#f0f6fc', fontSize: 14 }}>
          {tipo === 'income' ? 'Recebido' : 'Pago'}
        </label>
      </div>

      {/* Observações */}
      <div>
        <label style={S.label}>Observações (opcional)</label>
        <textarea name="notes" rows={3} placeholder="Notas adicionais..."
          defaultValue={transaction.notes ?? ''}
          style={{ ...S.input, resize: 'none' }} />
      </div>

      {error && (
        <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 12, padding: '12px 16px' }}>
          <p style={{ color: '#f85149', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* Botões fixos */}
      <div className="fixed bottom-20 left-0 right-0 px-5 pt-3 pb-3"
        style={{ background: 'rgba(6,9,15,0.95)', borderTop: '1px solid rgba(0,214,143,0.15)', backdropFilter: 'blur(12px)' }}>
        <div className="flex gap-3">
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="flex-none py-3 px-5 rounded-2xl text-sm font-semibold transition"
            style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: '#f85149' }}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold transition"
            style={{ background: 'linear-gradient(135deg,#00d68f,#00a870)', color: '#fff', opacity: loading ? 0.6 : 1, boxShadow: '0 0 14px rgba(0,214,143,0.4)' }}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </form>
  )
}
