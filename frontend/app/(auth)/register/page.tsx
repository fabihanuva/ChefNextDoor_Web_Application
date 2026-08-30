'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUpCustomer, type AuthState } from '@/lib/actions/auth'

export default function CustomerRegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signUpCustomer,
    undefined
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EF] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <h1 className="font-serif text-2xl text-[#2D6A4F] mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Order home-cooked meals near you</p>

        <form action={formAction} className="space-y-4">
          <Field label="Full name" name="fullName" type="text" />
          <Field label="Email" name="email" type="email" />
          <Field label="Phone" name="phone" type="tel" />
          <Field label="Password" name="password" type="password" />

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-[#2D6A4F] text-white py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-[#E0A23B] font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type,
}: {
  label: string
  name: string
  type: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        required
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
      />
    </div>
  )
}
