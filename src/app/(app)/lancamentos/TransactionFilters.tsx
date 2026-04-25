'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export default function TransactionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tipo = searchParams.get('tipo') ?? 'todos'
  const status = searchParams.get('status') ?? 'todos'

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, value)
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const btnBase = 'px-3 py-1.5 rounded-full text-xs font-medium transition'
  const active = 'text-white'
  const inactive = 'text-gray-400'

  return (
    <div className="px-4 py-3 flex gap-4 overflow-x-auto" style={{ borderBottom: '1px solid rgba(0,214,143,0.12)' }}>
      <div className="flex gap-2 items-center shrink-0">
        <span className="text-xs font-medium" style={{ color: '#7a9bb5' }}>Tipo:</span>
        {(['todos', 'income', 'expense'] as const).map((v) => (
          <button
            key={v}
            onClick={() => update('tipo', v)}
            className={`${btnBase} ${tipo === v ? active : inactive}`}
            style={tipo === v ? { background: '#00d68f' } : { background: 'rgba(0,214,143,0.05)' }}
          >
            {v === 'todos' ? 'Todos' : v === 'income' ? 'Receitas' : 'Despesas'}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center shrink-0">
        <span className="text-xs font-medium" style={{ color: '#7a9bb5' }}>Status:</span>
        {(['todos', 'pago', 'pendente'] as const).map((v) => (
          <button
            key={v}
            onClick={() => update('status', v)}
            className={`${btnBase} ${status === v ? active : inactive}`}
            style={status === v ? { background: '#00d68f' } : { background: 'rgba(0,214,143,0.05)' }}
          >
            {v === 'todos' ? 'Todos' : v === 'pago' ? 'Pago' : 'Pendente'}
          </button>
        ))}
      </div>
    </div>
  )
}
