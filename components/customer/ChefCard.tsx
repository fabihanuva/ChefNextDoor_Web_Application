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
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
    >
      <div className="relative h-40 bg-brand-cream">
        {avatar ? (
          <Image src={avatar} alt={name} fill className="object-cover" />
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
