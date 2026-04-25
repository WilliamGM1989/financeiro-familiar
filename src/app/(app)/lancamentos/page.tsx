import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import { Suspense } from 'react'
import Link from 'next/link'
import TransactionFilters from './TransactionFilters'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${String(year).slice(2)}`
}

const monthName = (month: number) => {
  const names = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return names[month] ?? ''
}

type SearchParams = { tipo?: string; status?: string }

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const tipo = params.tipo ?? 'todos'
  const status = params.status ?? 'todos'

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`

  const family_id = await getFamilyId()
  const supabase = await createClient()

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id,
      description,
      amount,
      type,
      date,
      paid,
      category_id,
      categories ( id, name, color ),
      accounts ( id, name, color )
    `)
    .eq('family_id', family_id)
    .gte('date', firstDay)
    .lte('date', lastDay)
    .order('date', { ascending: false })

  const allTransactions = transactions ?? []

  const totalIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const filtered = allTransactions.filter((t) => {
    const tipoOk =
      tipo === 'todos' || t.type === tipo
    const statusOk =
      status === 'todos' ||
      (status === 'pago' && t.paid) ||
      (status === 'pendente' && !t.paid)
    return tipoOk && statusOk
  })

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: 'linear-gradient(180deg,rgba(6,9,15,0.96) 0%,rgba(13,21,32,0.88) 100%)', borderBottom: '1px solid rgba(0,214,143,0.18)', backdropFilter: 'blur(6px)' }}>
        <p style={{ color: '#7a9bb5', fontSize: 12, fontWeight: 500 }}>Histórico</p>
        <h1 style={{ color: '#e8f4f0', fontSize: 24, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginTop: 2 }}>Lançamentos</h1>
        <p style={{ color: '#7a9bb5', fontSize: 12, marginTop: 4 }}>{monthName(month)} {year}</p>
      </div>

      {/* Summary cards */}
      <div className="px-5 pt-5 grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl p-4" style={{ background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.2)' }}>
          <p style={{ color: '#7a9bb5', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Receitas</p>
          <p style={{ color: '#00d68f', fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginTop: 4 }}>{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)' }}>
          <p style={{ color: '#7a9bb5', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Despesas</p>
          <p style={{ color: '#f85149', fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginTop: 4 }}>{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {/* List card */}
      <div className="px-5 rounded-2xl overflow-hidden" style={{ background: 'rgba(13,21,32,0.97)', border: '1px solid rgba(0,214,143,0.12)', margin: '0 20px' }}>
        {/* Filters */}
        <Suspense fallback={<div className="h-12" />}>
          <TransactionFilters />
        </Suspense>

        <div className="border-t border-gray-100" />

        {filtered.length === 0 ? (
          <div className="px-4 py-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(0,214,143,0.05)' }}>
              <svg className="w-6 h-6" fill="none" stroke="#8b949e" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p style={{ color: '#7a9bb5', fontSize: 13 }}>Nenhum lançamento</p>
            <p style={{ color: '#4a6a7a', fontSize: 11, marginTop: 4 }}>Toque em + para adicionar</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map((t) => {
              const isIncome = t.type === 'income'
              const category = Array.isArray(t.categories)
                ? t.categories[0]
                : t.categories
              const account = Array.isArray(t.accounts)
                ? t.accounts[0]
                : t.accounts

              return (
                <li key={t.id} style={{ borderBottom: '1px solid rgba(0,214,143,0.07)' }}>
                <Link href={`/lancamentos/${t.id}/editar`} className="px-4 py-3 flex items-center gap-3 w-full" style={{ display: 'flex' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: isIncome ? 'rgba(0,214,143,0.15)' : 'rgba(248,81,73,0.15)' }}>
                    <svg className="w-4 h-4" fill="none" stroke={isIncome ? '#00d68f' : '#f85149'} viewBox="0 0 24 24">
                      {isIncome
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 600 }} className="truncate">{t.description ?? 'Sem descrição'}</p>
                    <p style={{ color: '#7a9bb5', fontSize: 11 }} className="truncate">
                      {category?.name ?? 'Sem categoria'}{account ? ` · ${account.name}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p style={{ color: isIncome ? '#00d68f' : '#f85149', fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <span style={{ color: '#4a6a7a', fontSize: 10 }}>{formatDate(t.date)}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                        background: t.paid ? 'rgba(0,214,143,0.15)' : 'rgba(227,179,65,0.15)',
                        color: t.paid ? '#00d68f' : '#e3b341',
                        border: `1px solid ${t.paid ? 'rgba(0,214,143,0.25)' : 'rgba(227,179,65,0.25)'}`,
                      }}>
                        {t.paid ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/novo"
        className="fixed right-6 bottom-24 w-14 h-14 rounded-full flex items-center justify-center transition"
        style={{ background: 'linear-gradient(135deg,#00d68f,#00a870)', color: '#fff', boxShadow: '0 0 22px rgba(0,214,143,0.5), 0 4px 16px rgba(0,0,0,0.4)', border: '1.5px solid rgba(0,214,143,0.6)' }}
        aria-label="Novo lançamento"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  )
}
