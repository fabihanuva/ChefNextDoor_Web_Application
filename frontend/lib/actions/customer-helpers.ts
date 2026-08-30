import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * tbl_order.ord_customer_id and tbl_favorites.fav_customer_id reference
 * tbl_customer.cs_id — NOT the Supabase Auth user id directly. Every
 * server action that writes to those tables needs to resolve this first.
 */
export async function getCustomerId(
  supabase: SupabaseClient,
  authUserId: string
): Promise<number | null> {
  const { data } = await supabase
    .from('tbl_customer')
    .select('cs_id')
    .eq('cs_user_id', authUserId)
    .single()

  return data?.cs_id ?? null
}
