'use client'

import { useActionState, useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { createReview, type ReviewState } from '@/lib/actions/review'
import { cn } from '@/lib/utils'

export function ReviewForm({ orderId }: { orderId: number }) {
  const [state, formAction, isPending] = useActionState<ReviewState, FormData>(
    createReview,
    undefined
  )
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)

  if (state?.success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6 text-center">
        <p className="text-brand-green font-medium">Thanks for your review!</p>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="bg-white rounded-2xl border border-gray-100 p-6 mt-6 space-y-4"
    >
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="rating" value={rating} />

      <p className="font-medium text-gray-900">How was your order?</p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${n} stars`}
          >
            <Star
              size={28}
              className={cn(
                (hovered || rating) >= n
                  ? 'fill-brand-gold text-brand-gold'
                  : 'text-gray-300'
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        placeholder="Add a comment (optional)"
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending || rating === 0}>
        {isPending ? 'Submitting...' : 'Submit review'}
      </Button>
    </form>
  )
}
