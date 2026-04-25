import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EditarLancamentoForm from './EditarLancamentoForm'

export default async function EditarLancamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const familyId = await getFamilyId()
  const supabase = await createClient()

  const [{ data: transaction }, { data: categories }, { data: accounts }] = await Promise.all([
    supabase.from('transactions').select('*').eq('id', id).eq('family_id', familyId).single(),
    supabase.from('categories').select('*').eq('family_id', familyId).order('name'),
    supabase.from('accounts').select('*').eq('family_id', familyId).eq('is_active', true).order('name'),
  ])

  if (!transaction) notFound()

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(180deg,rgba(6,9,15,0.96) 0%,rgba(13,21,32,0.88) 100%)', borderBottom: '1px solid rgba(0,214,143,0.18)', backdropFilter: 'blur(6px)' }}>
        <Link href="/lancamentos"
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,214,143,0.06)', border: '1px solid rgba(0,214,143,0.2)' }}>
          <svg className="w-5 h-5" fill="none" stroke="#00d68f" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 style={{ color: '#e8f4f0', fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
            Editar Lançamento
          </h1>
          <p style={{ color: '#7a9bb5', fontSize: 11, marginTop: 1 }}>{transaction.description ?? 'Sem descrição'}</p>
        </div>
      </div>

      <EditarLancamentoForm
        transaction={transaction}
        categories={categories ?? []}
        accounts={accounts ?? []}
      />
    </div>
  )
}
