'use client'

import { useActionState } from 'react'
import { updateProfile, type ProfileState } from '@/lib/actions/profile'
import { Button } from '@/components/shared/Button'

export function ProfileForm({
  email,
  fullName,
  phone,
}: {
  email: string
  fullName: string
  phone: string
}) {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    updateProfile,
    undefined
  )

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          value={email}
          disabled
          className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Full name</label>
        <input
          name="fullName"
          defaultValue={fullName}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Phone</label>
        <input
          name="phone"
          defaultValue={phone}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-brand-green">Profile updated.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  )
}
