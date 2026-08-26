'use client'

import { useActionState } from 'react'
import { Button } from '@/components/shared/Button'
import {
  createSupportContent,
  type SupportContentState,
} from '@/lib/actions/adminSupportContent'

export default function NewSupportContentPage() {
  const [state, formAction, isPending] = useActionState<SupportContentState, FormData>(
    createSupportContent,
    undefined
  )

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-gray-900 mb-6">Add support article</h1>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Content</label>
          <textarea
            name="content"
            rows={6}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Publishing...' : 'Publish'}
        </Button>
      </form>
    </div>
  )
}
