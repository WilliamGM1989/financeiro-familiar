'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

type ActionState = { error: string } | null

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'

  const { allowed, msUntilReset } = checkRateLimit(`login:${ip}`, 5, 60_000)
  if (!allowed) {
    const minutes = Math.ceil(msUntilReset / 60_000)
    return { error: `Muitas tentativas. Aguarde ${minutes} minuto(s).` }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'E-mail ou senha inválidos.' }

  redirect('/dashboard')
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'

  const { allowed, msUntilReset } = checkRateLimit(
    `register:${ip}`,
    3,
    3_600_000
  )
  if (!allowed) {
    const minutes = Math.ceil(msUntilReset / 60_000)
    return { error: `Muitas tentativas. Aguarde ${minutes} minuto(s).` }
  }

  const name = formData.get('name') as string
  const familyName = formData.get('familyName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return {
      error:
        'A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 número.',
    }
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  })

  if (authError || !authData.user) {
    return { error: 'Erro ao criar conta. Verifique os dados e tente novamente.' }
  }

  const { error: rpcError } = await supabase.rpc('register_family', {
    p_family_name: familyName,
  })

  if (rpcError) {
    return { error: 'Erro ao configurar família. Tente novamente.' }
  }

  redirect('/dashboard')
}
