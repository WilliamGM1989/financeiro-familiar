'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import { sanitizeError } from '@/lib/error-handler'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['Gestao_FamiliarWillcategories']['Row']

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VALID_CATEGORY_TYPES = ['income', 'expense'] as const

export async function createCategory(
  formData: FormData
): Promise<{ error: string } | { data: CategoryRow }> {
  try {
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const name = ((formData.get('name') as string) ?? '').trim()
    const type = formData.get('type') as CategoryRow['type']
    const icon = (formData.get('icon') as string) || 'tag'
    const color = (formData.get('color') as string) || '#6B7280'

    if (!name) return { error: 'Nome é obrigatório' }
    if (name.length > 100) return { error: 'Nome excede o tamanho máximo permitido' }
    if (!type || !VALID_CATEGORY_TYPES.includes(type as typeof VALID_CATEGORY_TYPES[number])) return { error: 'Tipo de categoria inválido' }

    const { data, error } = await supabase
      .from('Gestao_FamiliarWillcategories')
      .insert({ family_id, name, type, icon, color })
      .select()
      .single()

    if (error) return { error: sanitizeError(error) }

    revalidatePath('/')
    return { data }
  } catch (e) {
    return { error: sanitizeError(e) }
  }
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<{ error: string } | { data: CategoryRow }> {
  try {
    if (!UUID_RE.test(id)) return { error: 'ID inválido' }
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('Gestao_FamiliarWillcategories')
      .select('id')
      .eq('id', id)
      .eq('family_id', family_id)
      .single()

    if (fetchError || !existing) return { error: 'Categoria não encontrada' }

    const updates: Database['public']['Tables']['Gestao_FamiliarWillcategories']['Update'] = {}

    const name = formData.get('name') as string | null
    const type = formData.get('type') as CategoryRow['type'] | null
    const icon = formData.get('icon') as string | null
    const color = formData.get('color') as string | null

    if (name !== null && name.trim().length > 100) return { error: 'Nome excede o tamanho máximo permitido' }

    if (name?.trim()) updates.name = name.trim()
    if (type) updates.type = type
    if (icon) updates.icon = icon
    if (color) updates.color = color

    const { data, error } = await supabase
      .from('Gestao_FamiliarWillcategories')
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

export async function deleteCategory(
  id: string
): Promise<{ error: string } | { data: null }> {
  try {
    if (!UUID_RE.test(id)) return { error: 'ID inválido' }
    const family_id = await getFamilyId()
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('Gestao_FamiliarWillcategories')
      .select('id')
      .eq('id', id)
      .eq('family_id', family_id)
      .single()

    if (fetchError || !existing) return { error: 'Categoria não encontrada' }

    const { error } = await supabase.from('Gestao_FamiliarWillcategories').delete().eq('id', id)

    if (error) return { error: sanitizeError(error) }

    revalidatePath('/')
    return { data: null }
  } catch (e) {
    return { error: sanitizeError(e) }
  }
}
