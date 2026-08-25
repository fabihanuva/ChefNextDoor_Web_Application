import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getCustomerId } from '@/lib/actions/customer-helpers'
import { formatCurrency } from '@/lib/utils'
import { FavoriteButton } from '@/components/customer/FavoriteButton'

type FavoriteRow = {
  fav_dish_id: number
  tbl_dish: {
    dsh_id: number
    dsh_name: string
    dsh_price: number | string
    dsh_image_url: string | null
    dsh_chef_id: number
    tbl_chef_profile: {
      chf_id: number
      tbl_users: { usr_full_name: string } | null
    } | null
  } | null
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const customerId = await getCustomerId(supabase, user.id)

  const { data: favorites } = customerId
    ? await supabase
        .from('tbl_favorites')
        .select(
          'fav_dish_id, tbl_dish(dsh_id, dsh_name, dsh_price, dsh_image_url, dsh_chef_id, tbl_chef_profile(chf_id, tbl_users(usr_full_name)))'
        )
        .eq('fav_customer_id', customerId)
        .returns<FavoriteRow[]>()
    : { data: [] as FavoriteRow[] }

  const dishes = (favorites ?? []).filter((f) => f.tbl_dish)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Your favorite dishes</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map(({ tbl_dish: dish }) => {
          if (!dish) return null
          const chefId = dish.tbl_chef_profile?.chf_id
          const chefName = dish.tbl_chef_profile?.tbl_users?.usr_full_name ?? 'Chef'
          const price = Number(dish.dsh_price)

          return (
            <div
              key={dish.dsh_id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="relative h-36 bg-brand-cream">
                {dish.dsh_image_url ? (
                  <Image
                    src={dish.dsh_image_url}
                    alt={dish.dsh_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-brand-green/40 font-display text-3xl">
                    🍽
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <FavoriteButton dishId={dish.dsh_id} initialFavorited />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{dish.dsh_name}</h3>
                {chefId && (
                  <Link
                    href={`/chefs/${chefId}`}
                    className="text-sm text-gray-500 hover:text-brand-green"
                  >
                    {chefName}
                  </Link>
                )}
                <p className="font-mono text-brand-green font-medium mt-2">
                  {formatCurrency(price)}
                </p>
              </div>
            </div>
          )
        })}
        {dishes.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-12">
            You haven&apos;t favorited any dishes yet.
          </p>
        )}
      </div>
    </div>
  )
}
