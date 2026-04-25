import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import Link from 'next/link'
import { ExpenseChart, CategoryDonut } from '@/components/DashboardCharts'
import DashboardExpandableCards, { type TxItem, type AccountItem } from '@/components/DashboardExpandableCards'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${String(year).slice(2)}`
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// ---------------------------------------------------------------------------
// Category icon map
// ---------------------------------------------------------------------------

function CategoryIcon({ color }: { color: string | null }) {
  const bg = color ?? '#38bdf8'
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      style={{ background: `${bg}22`, border: `1.5px solid ${bg}44` }}
    >
      <div className="w-3 h-3 rounded-full" style={{ background: bg }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'Usuário'

  // Current month range
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`
  const currentMonthLabel = `${MONTH_NAMES[month]} ${year}`
  const todayLabel = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })

  // ---------------------------------------------------------------------------
  // Fetch data — safe: zero-state if the user has no family yet
  // ---------------------------------------------------------------------------

  let saldoDisponivel = 0
  let totalReceitas = 0
  let totalDespesas = 0
  let totalAPagar = 0
  let accountCount = 0
  let recentTransactions: {
    id: string
    description: string | null
    amount: number
    type: string
    date: string
    paid: boolean
    categories: { name: string; color: string | null } | null
    accounts: { name: string } | null
  }[] = []
  let goals: {
    id: string
    name: string
    target_amount: number
    current_amount: number
    deadline: string | null
  }[] = []

  // Expandable card detail lists
  let incomeList: TxItem[] = []
  let expenseList: TxItem[] = []
  let pendingList: TxItem[] = []
  let accountsList: AccountItem[] = []

  try {
    const familyId = await getFamilyId()

    // -------------------------------------------------------------------------
    // 1. Accounts — saldo de cada conta
    // -------------------------------------------------------------------------
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id, name, color, type, initial_balance')
      .eq('family_id', familyId)
      .eq('is_active', true)
      .order('name')

    const activeAccounts = accounts ?? []
    accountCount = activeAccounts.length

    if (activeAccounts.length > 0) {
      const accountIds = activeAccounts.map((a) => a.id)

      const { data: allTx } = await supabase
        .from('transactions')
        .select('account_id, amount, type')
        .eq('family_id', familyId)
        .in('account_id', accountIds)
        .eq('paid', true)

      const txList = allTx ?? []

      // Build accounts list with calculated balances
      accountsList = activeAccounts.map((acc) => {
        const accTx = txList.filter((t) => t.account_id === acc.id)
        const income = accTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
        const expense = accTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
        const balance = acc.initial_balance + income - expense
        return { id: acc.id, name: acc.name, color: acc.color ?? '#38bdf8', type: acc.type, balance }
      })

      saldoDisponivel = accountsList.reduce((total, a) => total + a.balance, 0)
    }

    // -------------------------------------------------------------------------
    // 2. Receitas e Despesas do mês atual — com detalhes para accordion
    // -------------------------------------------------------------------------
    const { data: monthDetailRaw } = await supabase
      .from('transactions')
      .select(`
        id,
        description,
        amount,
        type,
        date,
        paid,
        categories ( name, color ),
        accounts ( name )
      `)
      .eq('family_id', familyId)
      .gte('date', firstDay)
      .lte('date', lastDay)
      .order('date', { ascending: false })

    const monthDetailList = (monthDetailRaw ?? []).map((t) => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      date: t.date,
      paid: t.paid,
      category: Array.isArray(t.categories) ? (t.categories[0] ?? null) : t.categories,
      account: Array.isArray(t.accounts) ? (t.accounts[0] ?? null) : t.accounts,
    }))

    totalReceitas = monthDetailList.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    totalDespesas = monthDetailList.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    totalAPagar = monthDetailList.filter((t) => t.type === 'expense' && !t.paid).reduce((s, t) => s + t.amount, 0)

    incomeList = monthDetailList.filter((t) => t.type === 'income') as TxItem[]
    expenseList = monthDetailList.filter((t) => t.type === 'expense') as TxItem[]
    pendingList = monthDetailList.filter((t) => t.type === 'expense' && !t.paid) as TxItem[]

    // -------------------------------------------------------------------------
    // 3. Últimos 5 lançamentos
    // -------------------------------------------------------------------------
    const { data: recentRaw } = await supabase
      .from('transactions')
      .select(`
        id,
        description,
        amount,
        type,
        date,
        paid,
        categories ( name, color ),
        accounts ( name )
      `)
      .eq('family_id', familyId)
      .order('date', { ascending: false })
      .limit(5)

    recentTransactions = (recentRaw ?? []).map((t) => ({
      ...t,
      categories: Array.isArray(t.categories) ? t.categories[0] ?? null : t.categories,
      accounts: Array.isArray(t.accounts) ? t.accounts[0] ?? null : t.accounts,
    }))

    // -------------------------------------------------------------------------
    // 4. Metas
    // -------------------------------------------------------------------------
    const { data: goalsRaw } = await supabase
      .from('goals')
      .select('id, name, target_amount, current_amount, deadline')
      .eq('family_id', familyId)
      .order('deadline', { ascending: true })

    goals = goalsRaw ?? []
  } catch {
    // Sem família — manter zeros
  }

  // Balance indicator
  const balancePositive = saldoDisponivel >= 0

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'transparent', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="relative overflow-hidden px-5 pt-12 pb-6"
        style={{
          background: 'linear-gradient(180deg, rgba(6,9,15,0.97) 0%, rgba(13,21,32,0.9) 100%)',
          borderBottom: '1px solid rgba(0,214,143,0.2)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p style={{ color: '#7a9bb5', fontSize: 12, fontWeight: 500 }}>
              {todayLabel}
            </p>
            <h1
              style={{
                color: '#e8f4f0',
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "'Sora', sans-serif",
                lineHeight: 1.2,
                marginTop: 2,
              }}
            >
              Olá, {displayName}
            </h1>
          </div>

          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0"
            style={{
              background: 'linear-gradient(135deg, #00d68f, #00a870)',
              color: '#ffffff',
              fontFamily: "'Sora', sans-serif",
              boxShadow: '0 4px 20px -4px rgba(0,214,143,0.6)',
            }}
          >
            {displayName[0]?.toUpperCase()}
          </div>
        </div>

        {/* Main balance card — futuristic */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'rgba(0,214,143,0.04)',
            border: '1px solid rgba(0,214,143,0.28)',
            boxShadow: '0 0 30px rgba(0,214,143,0.12), inset 0 1px 0 rgba(0,214,143,0.08)',
          }}
        >
          {/* Corner accent lines */}
          <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none" style={{ borderTop: '2px solid rgba(0,214,143,0.5)', borderLeft: '2px solid rgba(0,214,143,0.5)', borderRadius: '12px 0 0 0' }} />
          <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none" style={{ borderBottom: '2px solid rgba(0,214,143,0.5)', borderRight: '2px solid rgba(0,214,143,0.5)', borderRadius: '0 0 12px 0' }} />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-1.5 h-1.5 rounded-full pulse-dot"
                style={{ background: balancePositive ? '#00d68f' : '#f85149', boxShadow: `0 0 6px ${balancePositive ? '#00d68f' : '#f85149'}` }}
              />
              <p style={{ color: '#7a9bb5', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Saldo disponível · {currentMonthLabel}
              </p>
            </div>

            <p
              style={{
                color: balancePositive ? '#00d68f' : '#f85149',
                fontSize: 36,
                fontWeight: 800,
                fontFamily: "'Sora', sans-serif",
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginTop: 4,
                textShadow: `0 0 20px ${balancePositive ? 'rgba(0,214,143,0.5)' : 'rgba(248,81,73,0.5)'}`,
              }}
            >
              {formatCurrency(saldoDisponivel)}
            </p>

            <p style={{ color: '#7a9bb5', fontSize: 12, marginTop: 8 }}>
              {accountCount === 0
                ? 'Cadastre uma conta para começar'
                : `${accountCount} ${accountCount === 1 ? 'conta ativa' : 'contas ativas'}`}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* METRIC CARDS — 2x2 grid expandable                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-5 pt-5">
        <p
          style={{
            color: '#7a9bb5',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Visão geral do mês
        </p>

        <DashboardExpandableCards
          totalReceitas={totalReceitas}
          totalDespesas={totalDespesas}
          totalAPagar={totalAPagar}
          accountCount={accountCount}
          incomeList={incomeList}
          expenseList={expenseList}
          pendingList={pendingList}
          accountsList={accountsList}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* GRÁFICO — Evolução das despesas                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-5 mt-5">
        <div
          className="rounded-2xl p-4 overflow-hidden"
          style={{
            background: 'rgba(13,21,32,0.97)',
            border: '1px solid rgba(0,214,143,0.12)',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2
                style={{
                  color: '#e8f4f0',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Evolução das Despesas
              </h2>
              <p style={{ color: '#7a9bb5', fontSize: 11, marginTop: 1 }}>Últimos 7 dias</p>
            </div>
            <div
              className="px-2 py-1 rounded-lg"
              style={{ background: 'rgba(248,81,73,0.12)', border: '1px solid rgba(248,81,73,0.2)' }}
            >
              <span style={{ color: '#f85149', fontSize: 11, fontWeight: 600 }}>
                {formatCurrency(totalDespesas)}
              </span>
            </div>
          </div>

          {totalDespesas > 0 ? (
            <ExpenseChart totalDespesas={totalDespesas} />
          ) : (
            <div
              className="flex flex-col items-center justify-center py-8"
              style={{ color: '#7a9bb5' }}
            >
              <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <p style={{ fontSize: 12 }}>Sem despesas este mês</p>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DONUT — Distribuição                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-5 mt-4">
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(13,21,32,0.97)',
            border: '1px solid rgba(0,214,143,0.12)',
          }}
        >
          <h2
            style={{
              color: '#e8f4f0',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              marginBottom: 12,
            }}
          >
            Distribuição do Mês
          </h2>
          <CategoryDonut
            totalDespesas={totalDespesas}
            totalReceitas={totalReceitas}
            totalAPagar={totalAPagar}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* LANÇAMENTOS RECENTES                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-5 mt-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(13,21,32,0.97)',
            border: '1px solid rgba(0,214,143,0.12)',
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(0,214,143,0.12)' }}
          >
            <h2
              style={{
                color: '#e8f4f0',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Lançamentos Recentes
            </h2>
            <Link
              href="/lancamentos"
              style={{
                color: '#38bdf8',
                fontSize: 12,
                fontWeight: 600,
                background: 'rgba(56,189,248,0.1)',
                border: '1px solid rgba(56,189,248,0.2)',
                borderRadius: 8,
                padding: '3px 10px',
              }}
            >
              Ver todos
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="px-4 py-10 flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(0,214,143,0.05)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="#8b949e" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p style={{ color: '#7a9bb5', fontSize: 13 }}>Nenhum lançamento ainda</p>
              <p style={{ color: '#4a6a7a', fontSize: 11, marginTop: 4 }}>Toque em + para adicionar</p>
            </div>
          ) : (
            <ul>
              {recentTransactions.map((t, idx) => {
                const isIncome = t.type === 'income'
                const catColor = t.categories?.color ?? (isIncome ? '#00d68f' : '#f85149')
                return (
                  <li
                    key={t.id}
                    className="px-4 py-3 flex items-center gap-3"
                    style={{
                      borderBottom: idx < recentTransactions.length - 1 ? '1px solid #21262d' : 'none',
                    }}
                  >
                    <CategoryIcon color={catColor} />

                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          color: '#e8f4f0',
                          fontSize: 13,
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.description ?? 'Sem descrição'}
                      </p>
                      <p
                        style={{
                          color: '#7a9bb5',
                          fontSize: 11,
                          marginTop: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.categories?.name ?? 'Sem categoria'}
                        {t.accounts ? ` · ${t.accounts.name}` : ''}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: isIncome ? '#00d68f' : '#f85149',
                          fontFamily: "'Sora', sans-serif",
                        }}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <div className="flex items-center gap-1.5 justify-end mt-1">
                        <span style={{ color: '#4a6a7a', fontSize: 10 }}>{formatDate(t.date)}</span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: t.paid ? 'rgba(0,214,143,0.15)' : 'rgba(227,179,65,0.15)',
                            color: t.paid ? '#00d68f' : '#e3b341',
                            border: `1px solid ${t.paid ? 'rgba(0,214,143,0.25)' : 'rgba(227,179,65,0.25)'}`,
                          }}
                        >
                          {t.paid ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* METAS                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-5 mt-4 mb-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(13,21,32,0.97)',
            border: '1px solid rgba(0,214,143,0.12)',
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(0,214,143,0.12)' }}
          >
            <h2
              style={{
                color: '#e8f4f0',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Metas
            </h2>
            <div
              className="px-2 py-0.5 rounded-lg"
              style={{
                background: 'rgba(56,189,248,0.1)',
                border: '1px solid rgba(56,189,248,0.2)',
              }}
            >
              <span style={{ color: '#38bdf8', fontSize: 11, fontWeight: 600 }}>
                {goals.length} {goals.length === 1 ? 'ativa' : 'ativas'}
              </span>
            </div>
          </div>

          {goals.length === 0 ? (
            <div className="px-4 py-8 flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(0,214,143,0.05)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="#8b949e" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p style={{ color: '#7a9bb5', fontSize: 13 }}>Nenhuma meta cadastrada</p>
              <p style={{ color: '#4a6a7a', fontSize: 11, marginTop: 4 }}>Defina metas em Cadastros</p>
            </div>
          ) : (
            <ul>
              {goals.map((goal, idx) => {
                const progress =
                  goal.target_amount > 0
                    ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
                    : 0
                const remaining = Math.max(0, goal.target_amount - goal.current_amount)
                const complete = remaining === 0

                // Color based on progress
                const progressColor =
                  complete ? '#00d68f' : progress > 60 ? '#38bdf8' : progress > 30 ? '#e3b341' : '#f85149'

                return (
                  <li
                    key={goal.id}
                    className="px-4 py-4"
                    style={{
                      borderBottom: idx < goals.length - 1 ? '1px solid #21262d' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: progressColor }}
                        />
                        <p
                          style={{
                            color: '#e8f4f0',
                            fontSize: 13,
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {goal.name}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: progressColor,
                          fontFamily: "'Sora', sans-serif",
                          flexShrink: 0,
                        }}
                      >
                        {Math.round(progress)}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div
                      className="w-full rounded-full overflow-hidden"
                      style={{ height: 6, background: 'rgba(0,214,143,0.05)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${progressColor}99, ${progressColor})`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span style={{ color: '#7a9bb5', fontSize: 11 }}>
                        {formatCurrency(goal.current_amount)}{' '}
                        <span style={{ color: '#4a6a7a' }}>/ {formatCurrency(goal.target_amount)}</span>
                      </span>
                      {complete ? (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#00d68f',
                            background: 'rgba(0,214,143,0.12)',
                            border: '1px solid rgba(0,214,143,0.25)',
                            borderRadius: 4,
                            padding: '2px 6px',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Concluída
                        </span>
                      ) : (
                        <span style={{ color: '#7a9bb5', fontSize: 11 }}>
                          Faltam{' '}
                          <span style={{ color: '#e3b341', fontWeight: 600 }}>
                            {formatCurrency(remaining)}
                          </span>
                        </span>
                      )}
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
