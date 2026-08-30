'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCustomerId } from './customer-helpers'
import { getChefOrderIds } from './chef-helpers'

const reviewSchema = z.object({
  orderId: z.coerce.number(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
})

export type ReviewState = { error?: string; success?: boolean } | undefined

/**
 * A review belongs to an order, not directly to a chef (see tbl_review).
 * Since a cart — and therefore an order — only ever contains one chef's
 * dishes, we can resolve "which chef does this order belong to" via a
 * single order_items -> dish hop.
 */
async function getOrderChefId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: number
): Promise<number | null> {
  const { data } = await supabase
    .from('tbl_order_items')
    .select('tbl_dish(dsh_chef_id)')
    .eq('oi_order_id', orderId)
    .limit(1)
    .single<{ tbl_dish: { dsh_chef_id: number } | null }>()

  return data?.tbl_dish?.dsh_chef_id ?? null
}

async function recomputeChefRating(
  supabase: Awaited<ReturnType<typeof createClient>>,
  chefId: number
) {
  const orderIds = await getChefOrderIds(supabase, chefId)
  if (orderIds.length === 0) return

  const { data: reviews } = await supabase
    .from('tbl_review')
    .select('rv_rating')
    .in('rv_order_id', orderIds)

  if (!reviews || reviews.length === 0) return

  const avg = reviews.reduce((sum, r) => sum + r.rv_rating, 0) / reviews.length

  await supabase
    .from('tbl_chef_profile')
    .update({ chf_rating_avg: Math.round(avg * 100) / 100 })
    .eq('chf_id', chefId)
}

export async function createReview(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const parsed = reviewSchema.safeParse({
    orderId: formData.get('orderId'),
    rating: formData.get('rating'),
    comment: formData.get('comment') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in' }

  const customerId = await getCustomerId(supabase, user.id)
  if (!customerId) return { error: 'Customer profile not found' }

  // Confirm this order belongs to the customer and is actually delivered
  const { data: order } = await supabase
    .from('tbl_order')
    .select('ord_id, ord_status, ord_customer_id')
    .eq('ord_id', parsed.data.orderId)
    .single()

  if (!order || order.ord_customer_id !== customerId) {
    return { error: 'Order not found' }
  }
  if (order.ord_status !== 'delivered') {
    return { error: 'You can only review delivered orders' }
  }

  const { error: insertError } = await supabase.from('tbl_review').insert({
    rv_order_id: parsed.data.orderId,
    rv_customer_id: customerId,
    rv_rating: parsed.data.rating,
    rv_comment: parsed.data.comment ?? null,
  })

  if (insertError) {
    // uq_rv_order_id means this fires if they've already reviewed this order
    return { error: insertError.message }
  }

  const chefId = await getOrderChefId(supabase, parsed.data.orderId)
  if (chefId) {
    await recomputeChefRating(supabase, chefId)
  }

  revalidatePath(`/orders/${parsed.data.orderId}/track`)
  return { success: true }
}

export async function getOrderReview(orderId: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tbl_review')
    .select('rv_rating, rv_comment')
    .eq('rv_order_id', orderId)
    .maybeSingle()

  return data
}
