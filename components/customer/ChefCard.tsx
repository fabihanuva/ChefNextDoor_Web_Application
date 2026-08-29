import Link from 'next/link'
import Image from 'next/image'
import { StarRating } from '@/components/shared/StarRating'
import type { Chef } from '@/lib/types'

export function ChefCard({ chef }: { chef: Chef }) {
  const name = chef.tbl_users?.usr_full_name ?? 'Chef'
  const avatar = chef.tbl_users?.usr_profile_image ?? null

  return (
    <Link
      href={`/chefs/${chef.chf_id}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out"
    >
      <div className="relative h-44 bg-brand-cream overflow-hidden">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-brand-green/40 font-display text-4xl">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{chef.chf_cuisine_type}</p>
        <StarRating rating={Number(chef.chf_rating_avg)} size={13} className="mt-2" />
      </div>
    </Link>
  )
}
