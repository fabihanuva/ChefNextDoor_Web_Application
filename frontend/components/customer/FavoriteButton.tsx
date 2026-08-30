'use client'

import { useTransition, useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavorite } from '@/lib/actions/favorites'
import { cn } from '@/lib/utils'

export function FavoriteButton({
  dishId,
  initialFavorited = false,
}: {
  dishId: number
  initialFavorited?: boolean
}) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    setFavorited((v) => !v) // optimistic
    startTransition(async () => {
      const result = await toggleFavorite(dishId)
      if (result?.error) setFavorited((v) => !v) // revert on failure
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label="Toggle favorite"
      className="p-2 rounded-full bg-white/90 border border-gray-200 hover:bg-white disabled:opacity-50 shadow-sm"
    >
      <Heart size={16} className={cn(favorited ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
    </button>
  )
}
