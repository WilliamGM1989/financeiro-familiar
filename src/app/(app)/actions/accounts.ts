'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import { sanitizeError } from '@/lib/error-handler'
import type { Database } from '@/lib/supabase/database.types'

type AccountRow = Database['public']['Tables']['Gestao_FamiliarWillaccounts']['Row']

export async function createAccount(
  formData: FormData
): Promise<{ error: string } | { data: AccountRow }> {
  try {
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const name = ((formData.get('name') as string) ?? '').trim()
    const type = formData.get('type') as AccountRow['type']
    const initial_balance = parseFloat((formData.get('initial_balance') as string) ?? '0')
    const color = (formData.get('color') as string) || '#10B981'
    const icon = (formData.get('icon') as string) || 'wallet'

    if (!name) return { error: 'Nome é obrigatório' }
    if (name.length > 100) return { error: 'Nome excede o tamanho máximo permitido' }
    if (!type) return { error: 'Tipo é obrigatório' }

    const { data, error } = await supabase
      .from('Gestao_FamiliarWillaccounts')
      .insert({ family_id, name, type, initial_balance, color, icon })
      .select()
      .single()

    if (error) return { error: sanitizeError(error) }

    revalidatePath('/')
    return { data }
  } catch (e) {
    return { error: sanitizeError(e) }
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
      .from('Gestao_FamiliarWillaccounts')
      .select('id')
      .eq('id', id)
      .eq('family_id', family_id)
      .single()

    if (fetchError || !existing) return { error: 'Conta não encontrada' }

    const name = ((formData.get('name') as string) ?? '').trim()
    const type = formData.get('type') as AccountRow['type']
    const initial_balance = formData.get('initial_balance')
      ? parseFloat(formData.get('initial_balance') as string)
      : undefined
    const color = formData.get('color') as string | null
    const icon = formData.get('icon') as string | null

    if (name && name.length > 100) return { error: 'Nome excede o tamanho máximo permitido' }

    const updates: Database['public']['Tables']['Gestao_FamiliarWillaccounts']['Update'] = {}
    if (name) updates.name = name
    if (type) updates.type = type
    if (initial_balance !== undefined) updates.initial_balance = initial_balance
    if (color) updates.color = color
    if (icon) updates.icon = icon

    const { data, error } = await supabase
      .from('Gestao_FamiliarWillaccounts')
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

export async function deleteAccount(
  id: string
): Promise<{ error: string } | { data: null }> {
  try {
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('Gestao_FamiliarWillaccounts')
      .select('id')
      .eq('id', id)
      .eq('family_id', family_id)
      .single()

    if (fetchError || !existing) return { error: 'Conta não encontrada' }

    const { error } = await supabase.from('Gestao_FamiliarWillaccounts').delete().eq('id', id)

    if (error) return { error: sanitizeError(error) }

    revalidatePath('/')
    return { data: null }
  } catch (e) {
    return { error: sanitizeError(e) }
  }
}
