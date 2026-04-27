'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '../actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">
        Bem-vindo de volta
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Acesse sua conta para continuar
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@exemplo.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
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
          className="w-full py-3 px-4 bg-[#064E3B] hover:bg-emerald-800 text-white font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {pending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Ainda não tem conta?{' '}
        <Link
          href="/register"
          className="text-emerald-700 font-medium hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </>
  )
}
