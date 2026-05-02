'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CicloTransaction } from './page'

interface Props {
  dia05Tx: CicloTransaction[]
  dia20Tx: CicloTransaction[]
  mesLabel: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${String(year).slice(2)}`
}

export default function CiclosClient({ dia05Tx, dia20Tx, mesLabel }: Props) {
  const [ciclo, setCiclo] = useState<'dia05' | 'dia20'>('dia05')

  const isDia05 = ciclo === 'dia05'
  const transactions = isDia05 ? dia05Tx : dia20Tx

  const accentColor = isDia05 ? '#00d68f' : '#38bdf8'
  const accentBg = isDia05 ? 'rgba(0,214,143,0.08)' : 'rgba(56,189,248,0.08)'
  const accentBorder = isDia05 ? 'rgba(0,214,143,0.25)' : 'rgba(56,189,248,0.25)'

  const incomeList = transactions.filter((t) => t.type === 'income')
  const expenseList = transactions.filter((t) => t.type === 'expense')
  const totalReceitas = incomeList.reduce((s, t) => s + t.amount, 0)
  const totalDespesas = expenseList.reduce((s, t) => s + t.amount, 0)
  const saldo = totalReceitas - totalDespesas
  const saldoPositivo = saldo >= 0

  const cicloLabel = isDia05
    ? { title: 'PAGAMENTO DO CASAL', sub: 'Dia 05 · Salários' }
    : { title: 'VALES DO CASAL', sub: 'Dia 20 · Vales' }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'transparent', fontFamily: "'DM Sans', sans-serif" }}>
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="px-5 pt-12 pb-5"
        style={{
          background: 'linear-gradient(180deg,rgba(6,9,15,0.97) 0%,rgba(13,21,32,0.9) 100%)',
          borderBottom: '1px solid rgba(0,214,143,0.18)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white transition hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Voltar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p style={{ color: '#7a9bb5', fontSize: 12, fontWeight: 500 }}>Ciclos de Pagamento</p>
            <p style={{ color: '#e8f4f0', fontSize: 18, fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1.2 }}>
              {mesLabel}
            </p>
          </div>
        </div>

        {/* ---- Toggle Pill ---- */}
        <div
          className="flex items-center justify-between rounded-2xl px-3 py-3"
          style={{ background: accentBg, border: `1.5px solid ${accentBorder}` }}
        >
          {/* Seta esquerda */}
          <button
            onClick={() => setCiclo(isDia05 ? 'dia20' : 'dia05')}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${accentBorder}`, color: accentColor }}
            aria-label="Ciclo anterior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Label central */}
          <button
            onClick={() => setCiclo(isDia05 ? 'dia20' : 'dia05')}
            className="flex-1 flex flex-col items-center transition active:scale-95"
          >
            <span
              style={{
                color: accentColor,
                fontSize: 13,
                fontWeight: 800,
                fontFamily: "'Sora', sans-serif",
                letterSpacing: '0.06em',
                textShadow: `0 0 12px ${accentColor}88`,
              }}
            >
              {cicloLabel.title}
            </span>
            <span style={{ color: '#7a9bb5', fontSize: 11, marginTop: 2 }}>{cicloLabel.sub}</span>
          </button>

          {/* Seta direita */}
          <button
            onClick={() => setCiclo(isDia05 ? 'dia20' : 'dia05')}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${accentBorder}`, color: accentColor }}
            aria-label="Próximo ciclo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-3">
          {(['dia05', 'dia20'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCiclo(c)}
              className="rounded-full transition"
              style={{
                width: c === ciclo ? 20 : 6,
                height: 6,
                background: c === ciclo ? accentColor : 'rgba(255,255,255,0.15)',
              }}
              aria-label={c === 'dia05' ? 'Dia 05' : 'Dia 20'}
            />
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SUMMARY CARDS                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-5 pt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.2)' }}>
          <p style={{ color: '#7a9bb5', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Receitas</p>
          <p style={{ color: '#00d68f', fontSize: 14, fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1.1 }}>
            {formatCurrency(totalReceitas)}
          </p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)' }}>
          <p style={{ color: '#7a9bb5', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Despesas</p>
          <p style={{ color: '#f85149', fontSize: 14, fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1.1 }}>
            {formatCurrency(totalDespesas)}
          </p>
        </div>
        <div
          className="rounded-2xl p-3 text-center"
          style={{
            background: saldoPositivo ? 'rgba(0,214,143,0.08)' : 'rgba(248,81,73,0.08)',
            border: `1px solid ${saldoPositivo ? 'rgba(0,214,143,0.2)' : 'rgba(248,81,73,0.2)'}`,
          }}
        >
          <p style={{ color: '#7a9bb5', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Saldo</p>
          <p
            style={{
              color: saldoPositivo ? '#00d68f' : '#f85149',
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "'Sora', sans-serif",
              lineHeight: 1.1,
            }}
          >
            {formatCurrency(saldo)}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* EMPTY STATE                                                         */}
      {/* ------------------------------------------------------------------ */}
      {transactions.length === 0 && (
        <div className="px-5 mt-8 flex flex-col items-center text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
          >
            <svg className="w-8 h-8" fill="none" stroke={accentColor} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p style={{ color: '#e8f4f0', fontSize: 14, fontWeight: 600 }}>Nenhum lançamento neste ciclo</p>
          <p style={{ color: '#7a9bb5', fontSize: 12, marginTop: 6, maxWidth: 240 }}>
            Adicione lançamentos com o ciclo <strong style={{ color: accentColor }}>{cicloLabel.title}</strong> selecionado ao criar.
          </p>
          <Link
            href="/novo"
            className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold transition"
            style={{ background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor }}
          >
            + Novo Lançamento
          </Link>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* RECEITAS                                                            */}
      {/* ------------------------------------------------------------------ */}
      {incomeList.length > 0 && (
        <div className="px-5 mt-5">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(13,21,32,0.97)', border: '1px solid rgba(0,214,143,0.12)' }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(0,214,143,0.1)' }}
            >
              <h2 style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                Receitas
              </h2>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#00d68f',
                  fontFamily: "'Sora', sans-serif",
                  background: 'rgba(0,214,143,0.1)',
                  border: '1px solid rgba(0,214,143,0.2)',
                  borderRadius: 8,
                  padding: '2px 10px',
                }}
              >
                {formatCurrency(totalReceitas)}
              </span>
            </div>
            <ul>
              {incomeList.map((t, idx) => (
                <li
                  key={t.id}
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: idx < incomeList.length - 1 ? '1px solid rgba(0,214,143,0.06)' : 'none' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(0,214,143,0.15)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="#00d68f" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 600 }} className="truncate">
                      {t.description ?? 'Sem descrição'}
                    </p>
                    <p style={{ color: '#7a9bb5', fontSize: 11 }} className="truncate">
                      {t.category?.name ?? 'Sem categoria'}{t.account ? ` · ${t.account.name}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p style={{ color: '#00d68f', fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                      +{formatCurrency(t.amount)}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <span style={{ color: '#4a6a7a', fontSize: 10 }}>{formatDate(t.date)}</span>
                      <span
                        style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
                          background: t.paid ? 'rgba(0,214,143,0.15)' : 'rgba(227,179,65,0.15)',
                          color: t.paid ? '#00d68f' : '#e3b341',
                          border: `1px solid ${t.paid ? 'rgba(0,214,143,0.25)' : 'rgba(227,179,65,0.25)'}`,
                        }}
                      >
                        {t.paid ? 'Recebido' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* DESPESAS                                                            */}
      {/* ------------------------------------------------------------------ */}
      {expenseList.length > 0 && (
        <div className="px-5 mt-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(13,21,32,0.97)', border: '1px solid rgba(248,81,73,0.12)' }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(248,81,73,0.1)' }}
            >
              <h2 style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                Despesas
              </h2>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#f85149',
                  fontFamily: "'Sora', sans-serif",
                  background: 'rgba(248,81,73,0.1)',
                  border: '1px solid rgba(248,81,73,0.2)',
                  borderRadius: 8,
                  padding: '2px 10px',
                }}
              >
                {formatCurrency(totalDespesas)}
              </span>
            </div>
            <ul>
              {expenseList.map((t, idx) => (
                <li
                  key={t.id}
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: idx < expenseList.length - 1 ? '1px solid rgba(248,81,73,0.06)' : 'none' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(248,81,73,0.15)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="#f85149" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 600 }} className="truncate">
                      {t.description ?? 'Sem descrição'}
                    </p>
                    <p style={{ color: '#7a9bb5', fontSize: 11 }} className="truncate">
                      {t.category?.name ?? 'Sem categoria'}{t.account ? ` · ${t.account.name}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p style={{ color: '#f85149', fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                      -{formatCurrency(t.amount)}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <span style={{ color: '#4a6a7a', fontSize: 10 }}>{formatDate(t.date)}</span>
                      <span
                        style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
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
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
