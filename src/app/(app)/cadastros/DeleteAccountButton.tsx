'use client'

import { useState } from 'react'
import { deleteAccount } from '@/app/(app)/actions/accounts'
import { useRouter } from 'next/navigation'

export default function DeleteAccountButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!confirm('Excluir esta conta? Lançamentos vinculados podem ser afetados.')) return
    setLoading(true)
    await deleteAccount(id)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition disabled:opacity-50"
      aria-label="Excluir conta"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  )
}
