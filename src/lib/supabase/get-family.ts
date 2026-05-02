import { cache } from 'react'
import { createClient } from './server'

export const getFamilyId = cache(async (): Promise<string> => {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('Gestao_FamiliarWillfamily_members')
    .select('family_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (error || !data) {
    throw new Error('Família não encontrada para o usuário')
  }

  return data.family_id
})
