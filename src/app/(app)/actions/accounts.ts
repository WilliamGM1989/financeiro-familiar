'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import type { Database } from '@/lib/supabase/database.types'

type AccountRow = Database['public']['Tables']['accounts']['Row']

export async function createAccount(
  formData: FormData
): Promise<{ error: string } | { data: AccountRow }> {
  try {
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const name = formData.get('name') as string
    const type = formData.get('type') as AccountRow['type']
    const initial_balance = parseFloat((formData.get('initial_balance') as string) ?? '0')
    const color = (formData.get('color') as string) || '#10B981'
    const icon = (formData.get('icon') as string) || 'wallet'

    if (!name?.trim()) return { error: 'Nome é obrigatório' }
    if (!type) return { error: 'Tipo é obrigatório' }

    const { data, error } = await supabase
      .from('accounts')
      .insert({ family_id, name: name.trim(), type, initial_balance, color, icon })
      .select()
      .single()

    if (error) return { error: error.message }

    revalidatePath('/')
    return { data }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro inesperado' }
  }
}

export async function updateAccount(
  id: string,
  formData: FormData
): Promise<{ error: string } | { data: AccountRow }> {
  try {
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', id)
      .eq('family_id', family_id)
      .single()

    if (fetchError || !existing) return { error: 'Conta não encontrada' }

    const name = formData.get('name') as string
    const type = formData.get('type') as AccountRow['type']
    const initial_balance = formData.get('initial_balance')
      ? parseFloat(formData.get('initial_balance') as string)
      : undefined
    const color = formData.get('color') as string | null
    const icon = formData.get('icon') as string | null

    const updates: Database['public']['Tables']['accounts']['Update'] = {}
    if (name?.trim()) updates.name = name.trim()
    if (type) updates.type = type
    if (initial_balance !== undefined) updates.initial_balance = initial_balance
    if (color) updates.color = color
    if (icon) updates.icon = icon

    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return { error: error.message }

    revalidatePath('/')
    return { data }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro inesperado' }
  }
}

export async function deleteAccount(
  id: string
): Promise<{ error: string } | { data: null }> {
  try {
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', id)
      .eq('family_id', family_id)
      .single()

    if (fetchError || !existing) return { error: 'Conta não encontrada' }

    const { error } = await supabase.from('accounts').delete().eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/')
    return { data: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro inesperado' }
  }
}
