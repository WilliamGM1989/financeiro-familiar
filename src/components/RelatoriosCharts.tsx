'use client'

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

interface Props {
  dailyExpenses: { day: string; value: number }[]
  byCategory: { name: string; total: number; color: string }[]
  totalReceitas: number
  totalDespesas: number
  totalAPagar: number
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function RelatoriosCharts({ dailyExpenses, byCategory, totalReceitas, totalDespesas, totalAPagar }: Props) {
  const pieData = [
    { name: 'Receitas', value: totalReceitas, color: '#00d68f' },
    { name: 'Despesas', value: totalDespesas, color: '#f85149' },
    { name: 'A Pagar', value: totalAPagar, color: '#e3b341' },
  ].filter(d => d.value > 0)

  return (
    <>
      {/* Gráfico de área — despesas diárias */}
      <div className="px-5 mt-4">
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(13,21,32,0.97)', border: '1px solid rgba(0,214,143,0.12)' }}
        >
          <h2 style={{ color: '#e8f4f0', fontSize: 14, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
            Evolução das Despesas
          </h2>
          <p style={{ color: '#7a9bb5', fontSize: 11, marginTop: -8, marginBottom: 12 }}>Dia a dia do mês</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={dailyExpenses} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f85149" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f85149" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: '#6e7681', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: '#6e7681', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ background: 'rgba(0,214,143,0.05)', border: '1px solid rgba(0,214,143,0.12)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#7a9bb5' }}
                itemStyle={{ color: '#f85149' }}
                formatter={(v) => [fmt(Number(v) || 0), 'Despesas']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f85149"
                strokeWidth={2}
                fill="url(#expGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#f85149', stroke: 'rgba(13,21,32,0.97)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut — distribuição */}
      {pieData.length > 0 && (
        <div className="px-5 mt-4">
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(13,21,32,0.97)', border: '1px solid rgba(0,214,143,0.12)' }}
          >
            <h2 style={{ color: '#e8f4f0', fontSize: 14, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>
              Distribuição do Mês
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ color: '#7a9bb5', fontSize: 11 }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ background: 'rgba(0,214,143,0.05)', border: '1px solid rgba(0,214,143,0.12)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [fmt(Number(v) || 0)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  )
}
