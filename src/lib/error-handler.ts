const PG_ERRORS: Record<string, string> = {
  '23505': 'Já existe um registro com essas informações.',
  '23503': 'Operação não permitida: há registros relacionados.',
  '23502': 'Um campo obrigatório não foi preenchido.',
  '23514': 'Os dados não atendem às regras de validação.',
  '42501': 'Você não tem permissão para realizar esta ação.',
}

const SUPABASE_AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha inválidos.',
  user_already_exists: 'Já existe uma conta com este e-mail.',
  email_not_confirmed: 'Confirme seu e-mail antes de continuar.',
  weak_password: 'A senha não atende aos requisitos de segurança.',
}

export function sanitizeError(error: unknown): string {
  console.error(error)

  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>

    // Supabase Auth error
    if (typeof e.code === 'string' && e.code in SUPABASE_AUTH_ERRORS) {
      return SUPABASE_AUTH_ERRORS[e.code]
    }

    // PostgreSQL error
    if (typeof e.code === 'string' && e.code in PG_ERRORS) {
      return PG_ERRORS[e.code]
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente.'
}
