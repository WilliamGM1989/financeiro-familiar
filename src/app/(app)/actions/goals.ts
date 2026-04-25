'use server'

import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/get-family'
import { revalidatePath } from 'next/cache'

export async function createGoal(formData: FormData) {
  const supabase = await createClient()
  const familyId = await getFamilyId()

  const name = String(formData.get('name') ?? '').trim()
  const targetAmount = parseFloat(String(formData.get('target_amount') ?? '0'))
  const currentAmount = parseFloat(String(formData.get('current_amount') ?? '0'))
  const deadline = String(formData.get('deadline') ?? '').trim() || null

  if (!name) return { error: 'Nome da meta é obrigatório.' }
  if (isNaN(targetAmount) || targetAmount <= 0) return { error: 'Valor alvo deve ser maior que zero.' }

  const { error } = await supabase.from('goals').insert({
    family_id: familyId,
    name,
    target_amount: targetAmount,
    current_amount: isNaN(currentAmount) ? 0 : Math.max(0, currentAmount),
    deadline,
  })

  if (error) return { error: error.message }

  revalidatePath('/cadastros')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateGoalProgress(id: string, formData: FormData) {
  const supabase = await createClient()
  const familyId = await getFamilyId()

  const add = parseFloat(String(formData.get('add_amount') ?? '0'))
  if (isNaN(add) || add <= 0) return { error: 'Valor deve ser maior que zero.' }

  // Fetch current value first
  const { data: goal, error: fetchError } = await supabase
    .from('goals')
    .select('current_amount, target_amount')
    .eq('id', id)
    .eq('family_id', familyId)
    .single()

  if (fetchError || !goal) return { error: 'Meta não encontrada.' }

  const newCurrent = Math.min(goal.current_amount + add, goal.target_amount)

  const { error } = await supabase
    .from('goals')
    .update({ current_amount: newCurrent })
    .eq('id', id)
    .eq('family_id', familyId)

  if (error) return { error: error.message }

  revalidatePath('/cadastros')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteGoal(id: string) {
  const supabase = await createClient()
  const familyId = await getFamilyId()

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('family_id', familyId)

  if (error) return { error: error.message }

  revalidatePath('/cadastros')
  revalidatePath('/dashboard')
  return { success: true }
}
