'use client'

import { useActionState, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/shared/Button'
import type { DishState } from '@/lib/actions/dish'
import type { Dish } from '@/lib/types'

export function DishForm({
  action,
  dish,
}: {
  action: (prevState: DishState, formData: FormData) => Promise<DishState>
  dish?: Dish
}) {
  const [state, formAction, isPending] = useActionState<DishState, FormData>(action, undefined)
  const [preview, setPreview] = useState<string | null>(dish?.dsh_image_url ?? null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      <div>
        <label className="text-sm font-medium text-gray-700">Dish name</label>
        <input
          name="name"
          defaultValue={dish?.dsh_name}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          defaultValue={dish?.dsh_description ?? ''}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Price (৳)</label>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={dish?.dsh_price ? Number(dish.dsh_price) : undefined}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isAvailable"
          name="isAvailable"
          type="checkbox"
          defaultChecked={dish?.dsh_is_available ?? true}
          className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
        />
        <label htmlFor="isAvailable" className="text-sm text-gray-700">
          Available for order
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Photo</label>
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 w-full text-sm"
        />
        {/* Plain <img> on purpose — this may be a local blob: preview URL,
            which next/image does not support. */}
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 mt-3 rounded-lg object-cover bg-brand-cream"
          />
        )}
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : dish ? 'Save changes' : 'Add dish'}
      </Button>
    </form>
  )
}
