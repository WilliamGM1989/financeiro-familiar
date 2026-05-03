'use server'

import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import { sanitizeError } from '@/lib/error-handler'
import { revalidatePath } from 'next/cache'

export async function createGoal(formData: FormData) {
  const supabase = await createClient()
  const familyId = await getFamilyId()

  const name = String(formData.get('name') ?? '').trim()
  const targetAmount = parseFloat(String(formData.get('target_amount') ?? '0'))
  const currentAmount = parseFloat(String(formData.get('current_amount') ?? '0'))
  const deadline = String(formData.get('deadline') ?? '').trim() || null

  if (!name) return { error: 'Nome da meta é obrigatório.' }
  if (name.length > 100) return { error: 'Nome excede o tamanho máximo permitido.' }
  if (isNaN(targetAmount) || targetAmount <= 0) return { error: 'Valor alvo deve ser maior que zero.' }

  const { error } = await supabase.from('Gestao_FamiliarWillgoals').insert({
    family_id: familyId,
    name,
    target_amount: targetAmount,
    current_amount: isNaN(currentAmount) ? 0 : Math.max(0, currentAmount),
    deadline,
  })

  if (error) return { error: sanitizeError(error) }

  revalidatePath('/cadastros')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateGoalProgress(id: string, formData: FormData) {
  const supabase = await createClient()
  const familyId = await getFamilyId()

  const add = parseFloat(String(formData.get('add_amount') ?? '0'))
  if (isNaN(add) || add <= 0) return { error: 'Valor deve ser maior que zero.' }

  // Verificar ownership antes de chamar a RPC
  const { data: existing, error: fetchError } = await supabase
    .from('Gestao_FamiliarWillgoals')
    .select('id')
    .eq('id', id)
    .eq('family_id', familyId)
    .single()

  if (fetchError || !existing) return { error: 'Meta não encontrada.' }

  // RPC atômica — elimina o race condition de read-modify-write.
  // O banco aplica LEAST(current_amount + p_amount, target_amount) em um único UPDATE.
  const { data, error } = await supabase.rpc('add_goal_progress', {
    p_goal_id: id,
    p_amount: add,
  })

  if (error) return { error: sanitizeError(error) }

  revalidatePath('/cadastros')
  revalidatePath('/dashboard')
  return { success: true, current_amount: data as number }
}

export async function deleteGoal(id: string) {
  const supabase = await createClient()
  const familyId = await getFamilyId()

  const { error } = await supabase
    .from('Gestao_FamiliarWillgoals')
    .delete()
    .eq('id', id)
    .eq('family_id', familyId)

  if (error) return { error: sanitizeError(error) }

  revalidatePath('/cadastros')
  revalidatePath('/dashboard')
  return { success: true }
}
