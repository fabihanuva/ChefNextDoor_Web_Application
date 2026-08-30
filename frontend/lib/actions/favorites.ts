'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCustomerId } from './customer-helpers'

export async function toggleFavorite(dishId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in' }

  const customerId = await getCustomerId(supabase, user.id)
  if (!customerId) return { error: 'Customer profile not found' }

  const { data: existing } = await supabase
    .from('tbl_favorites')
    .select('fav_id')
    .eq('fav_customer_id', customerId)
    .eq('fav_dish_id', dishId)
    .maybeSingle()

  if (existing) {
    await supabase.from('tbl_favorites').delete().eq('fav_id', existing.fav_id)
  } else {
    await supabase
      .from('tbl_favorites')
      .insert({ fav_customer_id: customerId, fav_dish_id: dishId })
  }

  revalidatePath('/favorites')
  return { error: undefined }
}
