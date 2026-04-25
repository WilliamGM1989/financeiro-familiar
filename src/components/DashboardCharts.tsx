'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExpenseChartProps {
  totalDespesas: number
}

interface CategoryEntry {
  name: string
  value: number
  color: string
}

interface CategoryDonutProps {
  totalDespesas: number
  totalReceitas: number
  totalAPagar: number
}

// ---------------------------------------------------------------------------
// Tooltip customizado para o gráfico de área
// ---------------------------------------------------------------------------

interface TooltipPayloadItem {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

function CustomAreaTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#1c2330',
        border: '1px solid rgba(0,214,143,0.12)',
        borderRadius: 10,
        padding: '8px 12px',
        fontSize: 12,
        color: '#e8f4f0',
      }}
    >
      <p style={{ color: '#7a9bb5', marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#f85149', fontWeight: 700 }}>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          payload[0].value
        )}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ExpenseChart — AreaChart dos últimos 7 dias
// ---------------------------------------------------------------------------

export function ExpenseChart({ totalDespesas }: ExpenseChartProps) {
  // Gera 7 dias anteriores com valores distribuídos de forma realista
  const today = new Date()
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')

    // Distribui o total de forma semi-aleatória mas determinística
    const seed = d.getDate() + d.getMonth()
    const weight = 0.05 + ((seed * 37) % 100) / 400
    const value = i === 6 ? totalDespesas * 0.35 : totalDespesas * weight

    return { day: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1), value: Math.round(value) }
  })

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f85149" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#f85149" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          tick={{ fill: '#8b949e', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8b949e', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomAreaTooltip />} cursor={false} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#f85149"
          strokeWidth={2}
          fill="url(#expGrad)"
          dot={{ fill: '#f85149', r: 3, strokeWidth: 0 }}
          activeDot={{ fill: '#f85149', r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// CategoryDonut — PieChart de distribuição
// ---------------------------------------------------------------------------

interface DonutTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: CategoryEntry }>
}

function DonutTooltip({ active, payload }: DonutTooltipProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div
      style={{
        background: '#1c2330',
        border: '1px solid rgba(0,214,143,0.12)',
        borderRadius: 10,
        padding: '6px 10px',
        fontSize: 11,
        color: '#e8f4f0',
      }}
    >
      <p style={{ color: entry.payload.color, fontWeight: 700 }}>{entry.name}</p>
      <p>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          entry.value
        )}
      </p>
    </div>
  )
}

export function CategoryDonut({ totalDespesas, totalReceitas, totalAPagar }: CategoryDonutProps) {
  const saldoPositivo = Math.max(0, totalReceitas - totalDespesas)

  const rawData: CategoryEntry[] = [
    { name: 'Despesas', value: totalDespesas || 1, color: '#f85149' },
    { name: 'Receitas', value: totalReceitas || 1, color: '#00d68f' },
    { name: 'A Pagar', value: totalAPagar || 1, color: '#e3b341' },
    ...(saldoPositivo > 0 ? [{ name: 'Saldo', value: saldoPositivo, color: '#38bdf8' }] : []),
  ]

  const total = rawData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={110} height={110}>
        <PieChart>
          <Pie
            data={rawData}
            cx="50%"
            cy="50%"
            innerRadius={32}
            outerRadius={50}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {rawData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legenda */}
      <div className="flex flex-col gap-2 flex-1">
        {rawData.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: entry.color }}
              />
              <span style={{ color: '#7a9bb5', fontSize: 11 }}>{entry.name}</span>
            </div>
            <span style={{ color: '#e8f4f0', fontSize: 11, fontWeight: 600 }}>
              {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
