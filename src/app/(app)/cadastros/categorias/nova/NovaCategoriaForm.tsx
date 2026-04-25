'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory } from '@/app/(app)/actions/categories'

const PRESET_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#64748B',
]

export default function NovaCategoriaForm() {
  const router = useRouter()
  const [tipo, setTipo] = useState<'expense' | 'income'>('expense')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('type', tipo)
    formData.set('color', color)

    const result = await createCategory(formData)
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      router.push('/cadastros')
    }
  }

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
  const inputCls =
    'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4 pb-28">
      {/* Tipo toggle */}
      <div>
        <label className={labelCls}>Tipo</label>
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button
            type="button"
            onClick={() => setTipo('expense')}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              tipo === 'expense'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setTipo('income')}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              tipo === 'income'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Receita
          </button>
        </div>
      </div>

      {/* Nome */}
      <div>
        <label htmlFor="name" className={labelCls}>Nome *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ex: Alimentação, Salário"
          className={inputCls}
        />
      </div>

      {/* Cor */}
      <div>
        <label className={labelCls}>Cor</label>
        <div className="flex gap-3 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition"
              style={{
                backgroundColor: c,
                boxShadow: color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : undefined,
              }}
              aria-label={`Cor ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Fixed save button */}
      <div className="fixed bottom-20 left-0 right-0 px-6 bg-white/90 backdrop-blur-sm pt-3 pb-3 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#064E3B] text-white font-semibold py-3 rounded-2xl text-sm hover:bg-emerald-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Salvar Categoria'}
        </button>
      </div>
    </form>
  )
}
