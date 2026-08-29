'use client'

import { useEffect } from 'react'
import { Button } from '@/components/shared/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-brand-cream px-4">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-2">🔥</p>
        <h1 className="font-display text-2xl text-gray-900 mb-2">
          Something burned in the kitchen
        </h1>
        <p className="text-gray-500 mb-6">
          An unexpected error occurred. Try again, or head back to the homepage.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="ghost" onClick={() => (window.location.href = '/')}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
