import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import Link from 'next/link'
import DeleteAccountButton from './DeleteAccountButton'
import DeleteCategoryButton from './DeleteCategoryButton'
import GoalActions from './GoalActions'

const accountTypeLabel: Record<string, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  wallet: 'Carteira',
  credit_card: 'Cartão de Crédito',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default async function CadastrosPage() {
  const family_id = await getFamilyId()
  const supabase = await createClient()

  const [{ data: accounts }, { data: categories }, { data: goalsRaw }] = await Promise.all([
    supabase
      .from('accounts')
      .select('*')
      .eq('family_id', family_id)
      .order('name'),
    supabase
      .from('categories')
      .select('*')
      .eq('family_id', family_id)
      .order('name'),
    supabase
      .from('goals')
      .select('*')
      .eq('family_id', family_id)
      .order('deadline', { ascending: true }),
  ])

  const goals = goalsRaw ?? []
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const incomeCategories = (categories ?? []).filter((c) => c.type === 'income')
  const expenseCategories = (categories ?? []).filter((c) => c.type === 'expense')

  const S = {
    page: { background: 'transparent' } as React.CSSProperties,
    header: { background: 'linear-gradient(180deg,rgba(6,9,15,0.96) 0%,rgba(13,21,32,0.9) 100%)', borderBottom: '1px solid rgba(0,214,143,0.18)', backdropFilter: 'blur(6px)' } as React.CSSProperties,
    card: { background: 'rgba(13,21,32,0.97)', border: '1px solid rgba(0,214,143,0.12)' } as React.CSSProperties,
    divider: { borderBottom: '1px solid rgba(0,214,143,0.07)' } as React.CSSProperties,
    sectionIncome: { background: 'rgba(0,214,143,0.08)', borderBottom: '1px solid rgba(0,214,143,0.12)' } as React.CSSProperties,
    sectionExpense: { background: 'rgba(248,81,73,0.08)', borderBottom: '1px solid rgba(0,214,143,0.12)' } as React.CSSProperties,
  }

  return (
    <div className="min-h-screen" style={S.page}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={S.header}>
        <p style={{ color: '#7a9bb5', fontSize: 12, fontWeight: 500 }}>Configurações</p>
        <h1 style={{ color: '#e8f4f0', fontSize: 24, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginTop: 2 }}>
          Cadastros
        </h1>
        <p style={{ color: '#7a9bb5', fontSize: 12, marginTop: 4 }}>Gerencie contas e categorias</p>
      </div>

      {/* Accounts */}
      <div className="px-5 pt-5 mb-4">
        <div className="rounded-2xl overflow-hidden" style={S.card}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,214,143,0.12)' }}>
            <h2 style={{ color: '#e8f4f0', fontSize: 14, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>Contas</h2>
            <Link href="/cadastros/contas/nova" style={{ color: '#00d68f', fontSize: 12, fontWeight: 600, background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.2)', borderRadius: 8, padding: '4px 12px' }}>
              + Nova conta
            </Link>
          </div>
          {(accounts ?? []).length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p style={{ color: '#7a9bb5', fontSize: 13 }}>Nenhuma conta cadastrada</p>
              <p style={{ color: '#4a6a7a', fontSize: 11, marginTop: 4 }}>Adicione uma conta para começar</p>
            </div>
          ) : (
            <ul>
              {(accounts ?? []).map((account, idx) => (
                <li key={account.id} className="px-4 py-3 flex items-center gap-3" style={idx < (accounts ?? []).length - 1 ? S.divider : {}}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: account.color + '30' }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: account.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 600 }} className="truncate">{account.name}</p>
                    <p style={{ color: '#7a9bb5', fontSize: 11 }}>{accountTypeLabel[account.type] ?? account.type} · {formatCurrency(account.initial_balance)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/cadastros/contas/${account.id}/editar`} className="p-2 rounded-lg transition" style={{ color: '#38bdf8' }} aria-label="Editar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <DeleteAccountButton id={account.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mb-6">
        <div className="rounded-2xl overflow-hidden" style={S.card}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,214,143,0.12)' }}>
            <h2 style={{ color: '#e8f4f0', fontSize: 14, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>Categorias</h2>
            <Link href="/cadastros/categorias/nova" style={{ color: '#00d68f', fontSize: 12, fontWeight: 600, background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.2)', borderRadius: 8, padding: '4px 12px' }}>
              + Nova categoria
            </Link>
          </div>

          {incomeCategories.length > 0 && (
            <>
              <div className="px-4 py-2" style={S.sectionIncome}>
                <p style={{ color: '#00d68f', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Receitas</p>
              </div>
              <ul>
                {incomeCategories.map((cat, idx) => (
                  <li key={cat.id} className="px-4 py-3 flex items-center gap-3" style={idx < incomeCategories.length - 1 ? S.divider : {}}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '30' }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                    <p className="flex-1" style={{ color: '#e8f4f0', fontSize: 13 }}>{cat.name}</p>
                    <div className="flex items-center gap-1">
                      <Link href={`/cadastros/categorias/${cat.id}/editar`} className="p-2 rounded-lg" style={{ color: '#38bdf8' }} aria-label="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <DeleteCategoryButton id={cat.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {expenseCategories.length > 0 && (
            <>
              <div className="px-4 py-2" style={S.sectionExpense}>
                <p style={{ color: '#f85149', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Despesas</p>
              </div>
              <ul>
                {expenseCategories.map((cat, idx) => (
                  <li key={cat.id} className="px-4 py-3 flex items-center gap-3" style={idx < expenseCategories.length - 1 ? S.divider : {}}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '30' }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                    <p className="flex-1" style={{ color: '#e8f4f0', fontSize: 13 }}>{cat.name}</p>
                    <div className="flex items-center gap-1">
                      <Link href={`/cadastros/categorias/${cat.id}/editar`} className="p-2 rounded-lg" style={{ color: '#38bdf8' }} aria-label="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <DeleteCategoryButton id={cat.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {(categories ?? []).length === 0 && (
            <div className="px-4 py-8 text-center">
              <p style={{ color: '#7a9bb5', fontSize: 13 }}>Nenhuma categoria cadastrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="px-5 mb-8">
        <div className="rounded-2xl overflow-hidden" style={S.card}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,214,143,0.12)' }}>
            <h2 style={{ color: '#e8f4f0', fontSize: 14, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>Metas</h2>
            <Link
              href="/cadastros/metas/nova"
              style={{ color: '#00d68f', fontSize: 12, fontWeight: 600, background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.2)', borderRadius: 8, padding: '4px 12px' }}
            >
              + Nova meta
            </Link>
          </div>

          {goals.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p style={{ color: '#7a9bb5', fontSize: 13 }}>Nenhuma meta cadastrada</p>
              <p style={{ color: '#4a6a7a', fontSize: 11, marginTop: 4 }}>Defina um objetivo financeiro</p>
            </div>
          ) : (
            <ul>
              {goals.map((goal, idx) => {
                const progress = goal.target_amount > 0
                  ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
                  : 0
                const isDone = goal.current_amount >= goal.target_amount
                const progressColor = isDone ? '#00d68f' : progress > 60 ? '#38bdf8' : progress > 30 ? '#e3b341' : '#f85149'

                return (
                  <li key={goal.id} className="px-4 py-4" style={idx < goals.length - 1 ? S.divider : {}}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: progressColor }} />
                          <p className="truncate" style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 600 }}>{goal.name}</p>
                        </div>
                        {goal.deadline && (
                          <p style={{ color: '#4a6a7a', fontSize: 11 }}>
                            Prazo: {new Date(goal.deadline + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center shrink-0">
                        {isDone && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#00d68f', background: 'rgba(0,214,143,0.12)', border: '1px solid rgba(0,214,143,0.25)', borderRadius: 4, padding: '2px 6px', marginRight: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Concluída
                          </span>
                        )}
                        <GoalActions id={goal.id} name={goal.name} current={goal.current_amount} target={goal.target_amount} />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full rounded-full overflow-hidden mb-2" style={{ height: 6, background: 'rgba(0,214,143,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${progressColor}99, ${progressColor})`, transition: 'width 0.5s' }} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span style={{ color: '#7a9bb5', fontSize: 12 }}>
                        {fmt(goal.current_amount)}{' '}
                        <span style={{ color: '#4a6a7a' }}>/ {fmt(goal.target_amount)}</span>
                      </span>
                      <span style={{ color: progressColor, fontSize: 12, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
