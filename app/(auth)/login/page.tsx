'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn, type AuthState } from '@/lib/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signIn,
    undefined
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EF] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <h1 className="font-serif text-2xl text-[#2D6A4F] mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Log in to ChefNextDoor</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-[#2D6A4F] text-white py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          New here?{' '}
          <Link href="/register" className="text-[#E0A23B] font-medium">
            Create a customer account
          </Link>
          {' · '}
          <Link href="/register/chef" className="text-[#E0A23B] font-medium">
            Join as a chef
          </Link>
        </p>
      </div>
    </div>
  )
}
