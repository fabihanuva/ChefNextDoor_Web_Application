import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StarRating } from '@/components/shared/StarRating'
import { DishCard } from '@/components/customer/DishCard'
import { getCustomerId } from '@/lib/actions/customer-helpers'
import type { Chef, Dish } from '@/lib/types'

export default async function ChefProfilePage({
  params,
}: {
  params: Promise<{ chefId: string }>
}) {
  const { chefId } = await params
  const supabase = await createClient()

  const { data: chef } = await supabase
    .from('tbl_chef_profile')
    .select('*, tbl_users(usr_full_name, usr_profile_image)')
    .eq('chf_id', chefId)
    .eq('chf_verification_status', 'verified')
    .single<Chef>()

  if (!chef) notFound()

  const { data: dishes } = await supabase
    .from('tbl_dish')
    .select('*')
    .eq('dsh_chef_id', chefId)
    .eq('dsh_is_available', true)
    .returns<Dish[]>()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Favorites are dish-level in this schema — fetch which of THIS chef's
  // dishes the current customer has already favorited, so each DishCard
  // can show the correct initial heart state.
  let favoritedDishIds = new Set<number>()
  if (user) {
    const customerId = await getCustomerId(supabase, user.id)
    if (customerId && dishes?.length) {
      const { data: favs } = await supabase
        .from('tbl_favorites')
        .select('fav_dish_id')
        .eq('fav_customer_id', customerId)
        .in(
          'fav_dish_id',
          dishes.map((d) => d.dsh_id)
        )
      favoritedDishIds = new Set(favs?.map((f) => f.fav_dish_id) ?? [])
    }
  }

  const name = chef.tbl_users?.usr_full_name ?? 'Chef'

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-20 h-20 rounded-full bg-brand-cream flex items-center justify-center font-display text-2xl text-brand-green">
          {name.charAt(0)}
        </div>
        <div>
          <h1 className="font-display text-2xl text-gray-900">{name}</h1>
          <p className="text-gray-500 text-sm">{chef.chf_cuisine_type}</p>
          <p className="text-gray-400 text-xs mt-0.5">{chef.chf_kitchen_address}</p>
          <StarRating rating={Number(chef.chf_rating_avg)} size={14} className="mt-1" />
        </div>
      </div>

      {chef.chf_bio && <p className="text-gray-600 max-w-2xl mb-8 mt-4">{chef.chf_bio}</p>}

      <h2 className="font-display text-xl text-gray-900 mb-4">Menu</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes?.map((dish) => (
          <DishCard
            key={dish.dsh_id}
            dish={dish}
            chefId={chef.chf_id}
            isLoggedIn={!!user}
            initialFavorited={favoritedDishIds.has(dish.dsh_id)}
          />
        ))}
        {dishes?.length === 0 && (
          <p className="text-gray-500 col-span-full py-8">
            This chef hasn&apos;t listed any dishes yet.
          </p>
        )}
      </div>
    </div>
  )
}
