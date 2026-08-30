import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * tbl_dish.dsh_chef_id and tbl_chef_profile ownership checks reference
 * tbl_chef_profile.chf_id — NOT the Supabase Auth user id directly.
 */
export async function getChefId(
  supabase: SupabaseClient,
  authUserId: string
): Promise<number | null> {
  const { data } = await supabase
    .from('tbl_chef_profile')
    .select('chf_id')
    .eq('chf_user_id', authUserId)
    .single()

  return data?.chf_id ?? null
}

/**
 * tbl_order has NO chef-reference column — a chef's orders can only be
 * found via order_items -> dish -> chf_id. Since carts are single-chef
 * by design (see CartProvider), every order belongs to exactly one chef,
 * so this two-step lookup is reliable.
 */
export async function getChefOrderIds(
  supabase: SupabaseClient,
  chefId: number
): Promise<number[]> {
  const { data: dishes } = await supabase
    .from('tbl_dish')
    .select('dsh_id')
    .eq('dsh_chef_id', chefId)

  const dishIds = dishes?.map((d) => d.dsh_id) ?? []
  if (dishIds.length === 0) return []

  const { data: items } = await supabase
    .from('tbl_order_items')
    .select('oi_order_id')
    .in('oi_dish_id', dishIds)

  return [...new Set(items?.map((i) => i.oi_order_id) ?? [])]
}
