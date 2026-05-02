'use client'

import { useActionState } from 'react'
import { resetPasswordAction } from '@/app/(auth)/actions'

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#064E3B' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg,#00d68f,#064E3B)' }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Nova senha</h1>
          <p className="text-sm text-gray-500 text-center mt-1">Escolha uma senha forte para sua conta.</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nova senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres, 1 maiúscula e 1 número.</p>
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
            {pending ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
