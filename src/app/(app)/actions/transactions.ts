'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import { sanitizeError } from '@/lib/error-handler'
import type { Database } from '@/lib/supabase/database.types'

type TransactionRow = Database['public']['Tables']['Gestao_FamiliarWilltransactions']['Row']

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VALID_TRANSACTION_TYPES = ['income', 'expense'] as const
const VALID_CYCLES = ['dia05', 'dia20'] as const

export async function createTransaction(
  formData: FormData
): Promise<{ error: string } | { data: TransactionRow }> {
  try {
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado' }

    const account_id = formData.get('account_id') as string
    const category_id = (formData.get('category_id') as string) || null
    const description = ((formData.get('description') as string | null) ?? '').trim() || null
    const amount = parseFloat(formData.get('amount') as string)
    const type = formData.get('type') as TransactionRow['type']
    const date = formData.get('date') as string
    const due_date = (formData.get('due_date') as string) || null
    const paid = formData.get('paid') === 'true'
    const notes = ((formData.get('notes') as string | null) ?? '').trim() || null
    const payment_cycle = (formData.get('payment_cycle') as TransactionRow['payment_cycle']) || null

    if (!account_id) return { error: 'Conta é obrigatória' }
    if (account_id && !UUID_RE.test(account_id)) return { error: 'ID de conta inválido' }
    if (category_id && !UUID_RE.test(category_id)) return { error: 'ID de categoria inválido' }
    if (!type || !VALID_TRANSACTION_TYPES.includes(type as typeof VALID_TRANSACTION_TYPES[number])) return { error: 'Tipo inválido' }
    if (!date) return { error: 'Data é obrigatória' }
    if (isNaN(amount) || amount <= 0) return { error: 'Valor inválido' }
    if (description && description.length > 500) return { error: 'Descrição excede o tamanho máximo permitido' }
    if (notes && notes.length > 500) return { error: 'Observações excedem o tamanho máximo permitido' }
    const payment_cycle_raw = formData.get('payment_cycle') as string | null
    if (payment_cycle_raw && !VALID_CYCLES.includes(payment_cycle_raw as typeof VALID_CYCLES[number])) return { error: 'Ciclo inválido' }

    const { data: account, error: accountError } = await supabase
      .from('Gestao_FamiliarWillaccounts')
      .select('id')
      .eq('id', account_id)
      .eq('family_id', family_id)
      .single()

    if (accountError || !account) return { error: 'Conta não pertence à família' }

    const { data, error } = await supabase
      .from('Gestao_FamiliarWilltransactions')
      .insert({
        family_id,
        account_id,
        category_id,
        user_id: user.id,
        description,
        amount,
        type,
        date,
        due_date,
        paid,
        notes,
        payment_cycle,
      })
      .select()
      .single()

    if (error) return { error: sanitizeError(error) }

    revalidatePath('/')
    return { data }
  } catch (e) {
    return { error: sanitizeError(e) }
  }
}

export async function updateTransaction(
  id: string,
  formData: FormData
): Promise<{ error: string } | { data: TransactionRow }> {
  try {
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('Gestao_FamiliarWilltransactions')
      .select('id')
      .eq('id', id)
      .eq('family_id', family_id)
      .single()

    if (fetchError || !existing) return { error: 'Lançamento não encontrado' }

    const updates: Database['public']['Tables']['Gestao_FamiliarWilltransactions']['Update'] = {}

    const account_id = formData.get('account_id') as string | null
    if (account_id) {
      const { data: account } = await supabase
        .from('Gestao_FamiliarWillaccounts')
        .select('id')
        .eq('id', account_id)
        .eq('family_id', family_id)
        .single()
      if (!account) return { error: 'Conta não pertence à família' }
      updates.account_id = account_id
    }

    const category_id = formData.get('category_id') as string | null
    const descriptionRaw = formData.get('description') as string | null
    const description = descriptionRaw !== null ? descriptionRaw.trim() : null
    const amountRaw = formData.get('amount') as string | null
    const type = formData.get('type') as TransactionRow['type'] | null
    const date = formData.get('date') as string | null
    const due_date = formData.get('due_date') as string | null
    const paidRaw = formData.get('paid') as string | null
    const notesRaw = formData.get('notes') as string | null
    const notes = notesRaw !== null ? notesRaw.trim() : null
    const paymentCycleRaw = formData.get('payment_cycle') as string | null

    if (description && description.length > 500) return { error: 'Descrição excede o tamanho máximo permitido' }
    if (notes && notes.length > 500) return { error: 'Observações excedem o tamanho máximo permitido' }

    if (category_id !== null) updates.category_id = category_id || null
    if (description !== null) updates.description = description
    if (amountRaw !== null) updates.amount = parseFloat(amountRaw)
    if (type) updates.type = type
    if (date) updates.date = date
    if (due_date !== null) updates.due_date = due_date || null
    if (paidRaw !== null) updates.paid = paidRaw === 'true'
    if (notes !== null) updates.notes = notes
    if (paymentCycleRaw !== null) updates.payment_cycle = (paymentCycleRaw as TransactionRow['payment_cycle']) || null

    const { data, error } = await supabase
      .from('Gestao_FamiliarWilltransactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return { error: sanitizeError(error) }

    revalidatePath('/')
    return { data }
  } catch (e) {
    return { error: sanitizeError(e) }
  }
}

export async function deleteTransaction(
  id: string
): Promise<{ error: string } | { data: null }> {
  try {
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('Gestao_FamiliarWilltransactions')
      .select('id')
      .eq('id', id)
      .eq('family_id', family_id)
      .single()

    if (fetchError || !existing) return { error: 'Lançamento não encontrado' }

    const { error } = await supabase.from('Gestao_FamiliarWilltransactions').delete().eq('id', id)

    if (error) return { error: sanitizeError(error) }

    revalidatePath('/')
    return { data: null }
  } catch (e) {
    return { error: sanitizeError(e) }
  }
}
