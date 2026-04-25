import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import Link from 'next/link'
import NovoLancamentoForm from './NovoLancamentoForm'

export default async function NovoLancamentoPage() {
  const family_id = await getFamilyId()
  const supabase = await createClient()

  const [{ data: categories }, { data: accounts }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('family_id', family_id)
      .order('name'),
    supabase
      .from('accounts')
      .select('*')
      .eq('family_id', family_id)
      .eq('is_active', true)
      .order('name'),
  ])

  return (
    <div className="min-h-screen bg-[#064E3B]">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-3">
        <Link
          href="/lancamentos"
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
          aria-label="Voltar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-white text-xl font-bold">Novo Lançamento</h1>
      </div>

      {/* Form card */}
      <div className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
        <NovoLancamentoForm
          categories={categories ?? []}
          accounts={accounts ?? []}
        />
      </div>
    </div>
  )
}
