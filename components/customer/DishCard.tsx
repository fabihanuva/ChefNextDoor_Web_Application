'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { formatCurrency } from '@/lib/utils'
import { FavoriteButton } from './FavoriteButton'
import { useCart } from './CartProvider'
import type { Dish } from '@/lib/types'

export function DishCard({
  dish,
  chefId,
  isLoggedIn,
  initialFavorited = false,
}: {
  dish: Dish
  chefId: number
  isLoggedIn: boolean
  initialFavorited?: boolean
}) {
  const { addItem } = useCart()
  const [message, setMessage] = useState<string | null>(null)
  const price = Number(dish.dsh_price)

  function handleAdd() {
    const result = addItem({
      dishId: dish.dsh_id,
      chefId,
      name: dish.dsh_name,
      price,
      imageUrl: dish.dsh_image_url,
      quantity: 1,
    })

    setMessage(result.ok ? 'Added to cart' : result.error ?? 'Could not add item')
    setTimeout(() => setMessage(null), 2500)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="relative h-36 bg-brand-cream">
        {dish.dsh_image_url ? (
          <Image src={dish.dsh_image_url} alt={dish.dsh_name} fill className="object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-brand-green/40 font-display text-3xl">
            🍽
          </div>
        )}
        {isLoggedIn && (
          <div className="absolute top-2 right-2">
            <FavoriteButton dishId={dish.dsh_id} initialFavorited={initialFavorited} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{dish.dsh_name}</h3>
        {dish.dsh_description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dish.dsh_description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-brand-green font-medium">{formatCurrency(price)}</span>
          <Button size="sm" onClick={handleAdd}>
            Add
          </Button>
        </div>
        {message && <p className="text-xs text-gray-500 mt-2">{message}</p>}
      </div>
    </div>
  )
}
