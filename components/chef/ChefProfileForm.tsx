'use client'

import { useActionState, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/shared/Button'
import { updateChefProfile, type ChefProfileState } from '@/lib/actions/chefProfile'

export function ChefProfileForm({
  fullName,
  cuisineType,
  kitchenAddress,
  bio,
  avatarUrl,
}: {
  fullName: string
  cuisineType: string
  kitchenAddress: string
  bio: string
  avatarUrl: string | null
}) {
  const [state, formAction, isPending] = useActionState<ChefProfileState, FormData>(
    updateChefProfile,
    undefined
  )
  const [preview, setPreview] = useState<string | null>(avatarUrl)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-brand-cream overflow-hidden shrink-0">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Avatar preview" className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Photo</label>
          <input
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block text-sm mt-1"
          />
        </div>
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
        <label className="text-sm font-medium text-gray-700">Cuisine type</label>
        <input
          name="cuisineType"
          defaultValue={cuisineType}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Kitchen address</label>
        <input
          name="kitchenAddress"
          defaultValue={kitchenAddress}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          name="bio"
          defaultValue={bio}
          rows={4}
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
