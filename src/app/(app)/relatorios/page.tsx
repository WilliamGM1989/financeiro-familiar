import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import { RelatoriosCharts } from '@/components/RelatoriosCharts'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default async function RelatoriosPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`
  const currentMonthLabel = `${MONTH_NAMES[month]} ${year}`

  let totalReceitas = 0
  let totalDespesas = 0
  let totalAPagar = 0
  let saldoLiquido = 0
  let byCategory: { name: string; total: number; color: string }[] = []
  let dailyExpenses: { day: string; value: number }[] = []

  try {
    const familyId = await getFamilyId()
    const supabase = await createClient()

    // Transações do mês
    const { data: monthTx } = await supabase
      .from('Gestao_FamiliarWilltransactions')
      .select('amount, type, paid, date, category_id, categories(name, color)')
      .eq('family_id', familyId)
      .gte('date', firstDay)
      .lte('date', lastDay)

    const list = monthTx ?? []

    totalReceitas = list.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    totalDespesas = list.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    totalAPagar = list.filter(t => t.type === 'expense' && !t.paid).reduce((s, t) => s + t.amount, 0)
    saldoLiquido = totalReceitas - totalDespesas

    // Despesas por categoria
    const catMap: Record<string, { name: string; total: number; color: string }> = {}
    list.filter(t => t.type === 'expense').forEach(t => {
      const cat = Array.isArray(t.categories) ? t.categories[0] : t.categories
      const key = cat?.name ?? 'Sem categoria'
      if (!catMap[key]) catMap[key] = { name: key, total: 0, color: cat?.color ?? '#6b7280' }
      catMap[key].total += t.amount
    })
    byCategory = Object.values(catMap).sort((a, b) => b.total - a.total).slice(0, 6)

    // Despesas por dia do mês
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const dayMap: Record<number, number> = {}
    list.filter(t => t.type === 'expense').forEach(t => {
      const day = parseInt(t.date.split('-')[2])
      dayMap[day] = (dayMap[day] ?? 0) + t.amount
    })
    dailyExpenses = Array.from({ length: daysInMonth }, (_, i) => ({
      day: String(i + 1).padStart(2, '0'),
      value: dayMap[i + 1] ?? 0,
    }))
  } catch {
    // sem família
  }

  const cards = [
    { label: 'Receitas', value: totalReceitas, color: '#00d68f', bg: '#162a1e', border: 'rgba(0,214,143,0.2)' },
    { label: 'Despesas', value: totalDespesas, color: '#f85149', bg: '#2a1616', border: 'rgba(248,81,73,0.2)' },
    { label: 'A Pagar', value: totalAPagar, color: '#e3b341', bg: '#2a2316', border: 'rgba(227,179,65,0.2)' },
    { label: 'Saldo', value: saldoLiquido, color: saldoLiquido >= 0 ? '#38bdf8' : '#f85149', bg: '#161b2a', border: 'rgba(56,189,248,0.2)' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-5"
        style={{
          background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
          borderBottom: '1px solid rgba(0,214,143,0.12)',
        }}
      >
        <p style={{ color: '#7a9bb5', fontSize: 12, fontWeight: 500 }}>Análise financeira</p>
        <h1
          style={{
            color: '#e8f4f0',
            fontSize: 24,
            fontWeight: 800,
            fontFamily: "'Sora', sans-serif",
            marginTop: 2,
          }}
        >
          Relatórios
        </h1>
        <p style={{ color: '#7a9bb5', fontSize: 12, marginTop: 4 }}>{currentMonthLabel}</p>
      </div>

      {/* Cards resumo */}
      <div className="px-5 pt-5 grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-4"
            style={{ background: card.bg, border: `1px solid ${card.border}` }}
          >
            <p style={{ color: '#7a9bb5', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {card.label}
            </p>
            <p
              style={{
                color: card.color,
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "'Sora', sans-serif",
                marginTop: 6,
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Gráficos — client component */}
      <RelatoriosCharts
        dailyExpenses={dailyExpenses}
        byCategory={byCategory}
        totalReceitas={totalReceitas}
        totalDespesas={totalDespesas}
        totalAPagar={totalAPagar}
      />

      {/* Categorias lista */}
      {byCategory.length > 0 && (
        <div className="px-5 mt-4 mb-6">
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,21,32,0.97)', border: '1px solid rgba(0,214,143,0.12)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,214,143,0.12)' }}>
              <h2 style={{ color: '#e8f4f0', fontSize: 14, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                Despesas por Categoria
              </h2>
            </div>
            <ul>
              {byCategory.map((cat, idx) => {
                const pct = totalDespesas > 0 ? (cat.total / totalDespesas) * 100 : 0
                return (
                  <li
                    key={cat.name}
                    className="px-4 py-3"
                    style={{ borderBottom: idx < byCategory.length - 1 ? '1px solid #21262d' : 'none' }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                        <span style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 500 }}>{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span style={{ color: '#f85149', fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                          {formatCurrency(cat.total)}
                        </span>
                        <span style={{ color: '#7a9bb5', fontSize: 10, marginLeft: 6 }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(0,214,143,0.05)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: cat.color }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {byCategory.length === 0 && (
        <div className="px-5 mt-6 mb-6">
          <div
            className="rounded-2xl p-8 flex flex-col items-center text-center"
            style={{ background: 'rgba(13,21,32,0.97)', border: '1px solid rgba(0,214,143,0.12)' }}
          >
            <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="#8b949e" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p style={{ color: '#7a9bb5', fontSize: 13 }}>Nenhum dado disponível</p>
            <p style={{ color: '#4a6a7a', fontSize: 11, marginTop: 4 }}>Adicione lançamentos para ver os relatórios</p>
          </div>
        </div>
      )}
    </div>
  )
}
