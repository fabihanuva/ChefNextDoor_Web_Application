'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUpChef, type AuthState } from '@/lib/actions/auth'

export default function ChefRegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signUpChef,
    undefined
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EF] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <h1 className="font-serif text-2xl text-[#2D6A4F] mb-1">Cook with ChefNextDoor</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your account will be reviewed by our team before you can list dishes.
        </p>

        <form action={formAction} className="space-y-4">
          <Field label="Full name" name="fullName" type="text" />
          <Field label="Email" name="email" type="email" />
          <Field label="Phone" name="phone" type="tel" />
          <Field label="Cuisine type" name="cuisineType" type="text" />
          <Field label="Kitchen address" name="kitchenAddress" type="text" />
          <Field label="Password" name="password" type="password" />

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-[#E0A23B] text-white py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Submitting...' : 'Apply as a chef'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-[#2D6A4F] font-medium">
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
