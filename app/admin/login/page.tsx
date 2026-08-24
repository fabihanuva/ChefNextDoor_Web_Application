'use client'

import { useActionState } from 'react'
import { adminSignIn } from '@/lib/actions/admin-auth'
import type { AuthState } from '@/lib/actions/auth'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    adminSignIn,
    undefined
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <h1 className="font-serif text-2xl text-gray-900 mb-1">Admin sign in</h1>
        <p className="text-sm text-gray-500 mb-6">ChefNextDoor platform administration</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-gray-900 text-white py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Admin accounts are provisioned manually — there is no self-registration.
        </p>
      </div>
    </div>
  )
}
