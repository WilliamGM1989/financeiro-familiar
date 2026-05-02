import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import CiclosClient from './CiclosClient'

export type CicloTransaction = {
  id: string
  description: string | null
  amount: number
  type: string
  date: string
  paid: boolean
  payment_cycle: string | null
  category: { name: string; color: string | null } | null
  account: { name: string } | null
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRow(t: any): CicloTransaction {
  return {
    id: t.id,
    description: t.description,
    amount: t.amount,
    type: t.type,
    date: t.date,
    paid: t.paid,
    payment_cycle: t.payment_cycle,
    category: Array.isArray(t.categories) ? (t.categories[0] ?? null) : t.categories,
    account: Array.isArray(t.accounts) ? (t.accounts[0] ?? null) : t.accounts,
  }
}

export default async function CiclosPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`
  const mesLabel = `${MONTH_NAMES[month]} ${year}`

  let dia05Tx: CicloTransaction[] = []
  let dia20Tx: CicloTransaction[] = []

  try {
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const selectFields =
      'id, description, amount, type, date, paid, payment_cycle, categories(name, color), accounts(name)'

    const [{ data: raw05 }, { data: raw20 }] = await Promise.all([
      supabase
        .from('Gestao_FamiliarWilltransactions')
        .select(selectFields)
        .eq('family_id', family_id)
        .eq('payment_cycle', 'dia05')
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false }),
      supabase
        .from('Gestao_FamiliarWilltransactions')
        .select(selectFields)
        .eq('family_id', family_id)
        .eq('payment_cycle', 'dia20')
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false }),
    ])

    dia05Tx = (raw05 ?? []).map(normalizeRow)
    dia20Tx = (raw20 ?? []).map(normalizeRow)
  } catch {
    // sem família — mantém arrays vazios
  }

  return <CiclosClient dia05Tx={dia05Tx} dia20Tx={dia20Tx} mesLabel={mesLabel} />
}
