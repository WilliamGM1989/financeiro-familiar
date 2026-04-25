'use client'

import { useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TxItem = {
  id: string
  description: string | null
  amount: number
  date: string
  paid: boolean
  category: { name: string; color: string | null } | null
  account: { name: string } | null
}

export type AccountItem = {
  id: string
  name: string
  color: string
  type: string
  balance: number
}

type CardKey = 'income' | 'expense' | 'pending' | 'accounts'

interface Props {
  totalReceitas: number
  totalDespesas: number
  totalAPagar: number
  accountCount: number
  incomeList: TxItem[]
  expenseList: TxItem[]
  pendingList: TxItem[]
  accountsList: AccountItem[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const formatDate = (d: string) => {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${String(y).slice(2)}`
}

const accountTypeLabel: Record<string, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  wallet: 'Carteira',
  credit_card: 'Cartão de Crédito',
}

// ---------------------------------------------------------------------------
// Card config
// ---------------------------------------------------------------------------

const CARDS: {
  key: CardKey
  label: string
  gradientFrom: string
  gradientTo: string
  glowColor: string
  icon: React.ReactNode
}[] = [
  {
    key: 'income',
    label: 'Receitas',
    gradientFrom: '#1a7f37',
    gradientTo: '#0d4a1e',
    glowColor: 'rgba(0,214,143,0.35)',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    ),
  },
  {
    key: 'expense',
    label: 'Despesas',
    gradientFrom: '#8b1a1a',
    gradientTo: '#4d0f0f',
    glowColor: 'rgba(248,81,73,0.35)',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    ),
  },
  {
    key: 'pending',
    label: 'A Pagar',
    gradientFrom: '#7d5a00',
    gradientTo: '#4a3500',
    glowColor: 'rgba(227,179,65,0.35)',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'accounts',
    label: 'Contas',
    gradientFrom: '#1a3a6b',
    gradientTo: '#0d2044',
    glowColor: 'rgba(56,189,248,0.35)',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DashboardExpandableCards({
  totalReceitas,
  totalDespesas,
  totalAPagar,
  accountCount,
  incomeList,
  expenseList,
  pendingList,
  accountsList,
}: Props) {
  const [open, setOpen] = useState<CardKey | null>(null)

  const values: Record<CardKey, string> = {
    income: fmt(totalReceitas),
    expense: fmt(totalDespesas),
    pending: fmt(totalAPagar),
    accounts: `${accountCount} ativa${accountCount !== 1 ? 's' : ''}`,
  }

  const toggle = (key: CardKey) => setOpen((prev) => (prev === key ? null : key))

  // Active card config
  const activeCard = open ? CARDS.find((c) => c.key === open) : null

  return (
    <div>
      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((card) => {
          const isOpen = open === card.key
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => toggle(card.key)}
              className="relative overflow-hidden rounded-2xl p-4 flex flex-col justify-between text-left w-full"
              style={{
                background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})`,
                boxShadow: isOpen
                  ? `0 0 0 2px rgba(255,255,255,0.25), 0 8px 32px -8px ${card.glowColor}`
                  : `0 8px 32px -8px ${card.glowColor}`,
                minHeight: 110,
                outline: 'none',
                transition: 'box-shadow 0.2s',
              }}
            >
              {/* Background decoration */}
              <div
                className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.3)' }}
              />
              <div
                className="absolute -right-1 -bottom-6 w-16 h-16 rounded-full opacity-10 pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.5)' }}
              />

              {/* Icon + chevron */}
              <div className="flex items-center justify-between relative">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  {card.icon}
                </div>
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)', transition: 'transform 0.25s' }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="rgba(255,255,255,0.9)"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s',
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Value + label */}
              <div className="relative mt-3">
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {card.label}
                </p>
                <p style={{ color: '#fff', fontSize: 18, fontWeight: 800, fontFamily: "'Sora', sans-serif", lineHeight: 1.2, marginTop: 2, letterSpacing: '-0.02em' }}>
                  {values[card.key]}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Expanded detail panel */}
      {open && activeCard && (
        <div
          className="mt-3 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(13,21,32,0.97)', border: `1px solid ${activeCard.glowColor.replace('0.35', '0.4')}` }}
        >
          {/* Panel header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(0,214,143,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${activeCard.gradientFrom}, ${activeCard.gradientTo})` }}
              >
                {activeCard.icon}
              </div>
              <p style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                {activeCard.label}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,214,143,0.05)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="#8b949e" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Panel body */}
          {open === 'accounts' ? (
            <AccountsDetail list={accountsList} />
          ) : (
            <TxDetail list={open === 'income' ? incomeList : open === 'expense' ? expenseList : pendingList} isIncome={open === 'income'} />
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Transaction detail list
// ---------------------------------------------------------------------------

function TxDetail({ list, isIncome }: { list: TxItem[]; isIncome: boolean }) {
  if (list.length === 0) {
    return (
      <div className="px-4 py-8 flex flex-col items-center text-center">
        <p style={{ color: '#7a9bb5', fontSize: 13 }}>Nenhum lançamento</p>
      </div>
    )
  }

  return (
    <ul>
      {list.map((t, idx) => {
        const color = t.category?.color ?? (isIncome ? '#00d68f' : '#f85149')
        return (
          <li
            key={t.id}
            className="px-4 py-3 flex items-center gap-3"
            style={{ borderBottom: idx < list.length - 1 ? '1px solid #21262d' : 'none' }}
          >
            {/* Color dot */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${color}22`, border: `1.5px solid ${color}44` }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="truncate"
                style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 600 }}
              >
                {t.description ?? 'Sem descrição'}
              </p>
              <p className="truncate" style={{ color: '#7a9bb5', fontSize: 11, marginTop: 1 }}>
                {t.category?.name ?? 'Sem categoria'}
                {t.account ? ` · ${t.account.name}` : ''}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p style={{ color: isIncome ? '#00d68f' : '#f85149', fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                {isIncome ? '+' : '-'}{fmt(t.amount)}
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
        )
      })}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Accounts detail list
// ---------------------------------------------------------------------------

function AccountsDetail({ list }: { list: AccountItem[] }) {
  if (list.length === 0) {
    return (
      <div className="px-4 py-8 flex flex-col items-center text-center">
        <p style={{ color: '#7a9bb5', fontSize: 13 }}>Nenhuma conta ativa</p>
      </div>
    )
  }

  return (
    <ul>
      {list.map((acc, idx) => (
        <li
          key={acc.id}
          className="px-4 py-3 flex items-center gap-3"
          style={{ borderBottom: idx < list.length - 1 ? '1px solid #21262d' : 'none' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `${acc.color}22`, border: `1.5px solid ${acc.color}44` }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: acc.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ color: '#e8f4f0', fontSize: 13, fontWeight: 600 }}>
              {acc.name}
            </p>
            <p style={{ color: '#7a9bb5', fontSize: 11, marginTop: 1 }}>
              {accountTypeLabel[acc.type] ?? acc.type}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Sora', sans-serif",
                color: acc.balance >= 0 ? '#00d68f' : '#f85149',
              }}
            >
              {fmt(acc.balance)}
            </p>
            <p style={{ color: '#4a6a7a', fontSize: 10, marginTop: 1 }}>saldo atual</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
