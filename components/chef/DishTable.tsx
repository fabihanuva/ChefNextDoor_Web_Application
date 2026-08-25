'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTransition } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { deleteDish, toggleDishAvailability } from '@/lib/actions/dish'
import { formatCurrency } from '@/lib/utils'
import type { Dish } from '@/lib/types'

export function DishTable({ dishes }: { dishes: Dish[] }) {
  const [isPending, startTransition] = useTransition()

  if (dishes.length === 0) {
    return (
      <p className="text-gray-500 text-center py-16">
        You haven&apos;t added any dishes yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {dishes.map((dish) => (
        <div
          key={dish.dsh_id}
          className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4"
        >
          <div className="relative w-14 h-14 rounded-lg bg-brand-cream overflow-hidden shrink-0">
            {dish.dsh_image_url && (
              <Image src={dish.dsh_image_url} alt={dish.dsh_name} fill className="object-cover" />
            )}
          </div>

          <div className="flex-1">
            <p className="font-medium text-gray-900">{dish.dsh_name}</p>
            <p className="text-sm text-gray-500 font-mono">
              {formatCurrency(Number(dish.dsh_price))}
            </p>
          </div>

          <button
            onClick={() =>
              startTransition(() => {
                toggleDishAvailability(dish.dsh_id, !dish.dsh_is_available)
              })
            }
            disabled={isPending}
          >
            <Badge variant={dish.dsh_is_available ? 'success' : 'neutral'}>
              {dish.dsh_is_available ? 'Available' : 'Hidden'}
            </Badge>
          </button>

          <Link
            href={`/chef/dishes/${dish.dsh_id}/edit`}
            className="text-gray-400 hover:text-brand-green"
          >
            <Pencil size={18} />
          </Link>

          <button
            onClick={() =>
              startTransition(() => {
                deleteDish(dish.dsh_id)
              })
            }
            disabled={isPending}
            className="text-gray-400 hover:text-red-600"
            aria-label="Delete dish"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}
