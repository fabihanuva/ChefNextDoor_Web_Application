import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/shared/Badge'
import { formatCurrency } from '@/lib/utils'
import type { Dish } from '@/lib/types'

export function ChefDishCard({ dish }: { dish: Dish }) {
  return (
    <Link
      href={`/chef/dishes/${dish.dsh_id}/edit`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-rotate-1 hover:scale-[1.02] transition-transform duration-200"
    >
      <div className="relative h-32 bg-brand-cream">
        {dish.dsh_image_url ? (
          <Image src={dish.dsh_image_url} alt={dish.dsh_name} fill className="object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-brand-green/40 font-display text-3xl">
            🍽
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={dish.dsh_is_available ? 'success' : 'neutral'}>
            {dish.dsh_is_available ? 'Available' : 'Hidden'}
          </Badge>
        </div>
      </div>
      <div className="p-3">
        <p className="font-medium text-gray-900 text-sm truncate">{dish.dsh_name}</p>
        <p className="font-mono text-brand-green text-sm mt-1">
          {formatCurrency(Number(dish.dsh_price))}
        </p>
      </div>
    </Link>
  )
}
