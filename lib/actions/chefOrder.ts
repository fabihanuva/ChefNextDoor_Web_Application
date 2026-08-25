'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getChefId, getChefOrderIds } from './chef-helpers'

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

/**
 * Updating ord_status here is what fires the Supabase Realtime event
 * that the customer's useRealtimeOrder hook (Phase 7) is subscribed to —
 * this is the other half of your Observer-pattern replacement.
 */
export async function updateOrderStatus(orderId: number, status: string) {
  if (!VALID_STATUSES.includes(status)) {
    return { error: 'Invalid status' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in' }

  const chefId = await getChefId(supabase, user.id)
  if (!chefId) return { error: 'Chef profile not found' }

  // Ownership guard: tbl_order has no chef column, so we confirm this
  // order actually belongs to this chef via order_items -> dish -> chf_id
  // before allowing the update.
  const ownedOrderIds = await getChefOrderIds(supabase, chefId)
  if (!ownedOrderIds.includes(orderId)) {
    return { error: 'This order does not belong to you' }
  }

  const { error } = await supabase
    .from('tbl_order')
    .update({ ord_status: status })
    .eq('ord_id', orderId)

  if (error) return { error: error.message }

  revalidatePath('/chef/orders')
  return { error: undefined }
}
