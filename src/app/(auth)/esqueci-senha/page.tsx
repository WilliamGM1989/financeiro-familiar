'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction } from '../actions'

export default function EsqueciSenhaPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, null)

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">
        Recuperar senha
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      {state?.success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 text-center">
          <svg className="w-10 h-10 text-emerald-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-emerald-700 font-semibold">{state.success}</p>
          <p className="text-sm text-emerald-600 mt-1">Clique no link que enviamos para seu e-mail.</p>
          <Link href="/login" className="mt-4 inline-block text-sm text-emerald-700 font-medium hover:underline">
            Voltar ao login
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="willeana89@gmail.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 px-4 bg-[#064E3B] hover:bg-emerald-800 text-white font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        Lembrou a senha?{' '}
        <Link href="/login" className="text-emerald-700 font-medium hover:underline">
          Voltar ao login
        </Link>
      </p>
    </>
  )
}
