'use client'

import { useActionState, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/shared/Button'
import { updateProfile, type ProfileState } from '@/lib/actions/profile'

export function ProfileForm({
  email,
  fullName,
  phone,
  defaultAddress,
  avatarUrl,
}: {
  email: string
  fullName: string
  phone: string
  defaultAddress: string
  avatarUrl: string | null
}) {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    updateProfile,
    undefined
  )
  const [preview, setPreview] = useState<string | null>(avatarUrl)
  const [removeAvatar, setRemoveAvatar] = useState(false)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
      setRemoveAvatar(false)
    }
  }

  function handleRemoveClick() {
    setPreview(null)
    setRemoveAvatar(true)
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="removeAvatar" value={removeAvatar ? 'true' : 'false'} />

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-brand-cream overflow-hidden shrink-0 flex items-center justify-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-2xl text-brand-green">
              {fullName.charAt(0) || '?'}
            </span>
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
          {preview && (
            <button
              type="button"
              onClick={handleRemoveClick}
              className="text-xs text-red-600 hover:underline mt-1"
            >
              Remove photo
            </button>
          )}
          {!preview && removeAvatar && (
            <p className="text-xs text-gray-500 mt-1">Photo will be removed on save.</p>
          )}
        </div>
      </div>

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

      <div>
        <label className="text-sm font-medium text-gray-700">Default delivery address</label>
        <textarea
          name="defaultAddress"
          defaultValue={defaultAddress}
          rows={2}
          placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
        <p className="text-xs text-gray-400 mt-1">
          Saved here for reference — you'll still confirm your delivery address at checkout.
        </p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-brand-green">Profile updated.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  )
}
