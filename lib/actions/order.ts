'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { activeDeliveryFeeStrategy } from '@/lib/strategies/deliveryFee'
import { getCustomerId } from './customer-helpers'

const checkoutItemSchema = z.object({
  dishId: z.number(),
  chefId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
})

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  deliveryAddress: z.string().min(5, 'Enter a delivery address'),
  paymentMethodId: z.coerce.number().int().positive('Select a payment method'),
})

export type PlaceOrderState = { error?: string } | undefined

export async function placeOrder(
  _prevState: PlaceOrderState,
  formData: FormData
): Promise<PlaceOrderState> {
  const raw = formData.get('cartPayload')
  if (typeof raw !== 'string') return { error: 'Missing cart data' }

  let parsedItems: unknown
  try {
    parsedItems = JSON.parse(raw)
  } catch {
    return { error: 'Could not read cart data' }
  }

  const parsed = checkoutSchema.safeParse({
    items: parsedItems,
    deliveryAddress: formData.get('deliveryAddress'),
    paymentMethodId: formData.get('paymentMethodId'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { items, deliveryAddress, paymentMethodId } = parsed.data
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in to place an order' }

  const customerId = await getCustomerId(supabase, user.id)
  if (!customerId) return { error: 'Customer profile not found' }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  // distanceKm is hardcoded until real geocoding/delivery-partner distance is wired up
  const deliveryFee = activeDeliveryFeeStrategy({ subtotal, distanceKm: 3 })
  const total = subtotal + deliveryFee

  // tbl_order only stores the final total — subtotal/delivery fee are
  // display-only figures derived from the cart, not persisted columns.
  const { data: order, error: orderError } = await supabase
    .from('tbl_order')
    .insert({
      ord_customer_id: customerId,
      ord_payment_method_id: paymentMethodId,
      ord_delivery_address: deliveryAddress,
      ord_total_amount: total,
      ord_status: 'pending',
    })
    .select('ord_id')
    .single()

  if (orderError || !order) {
    return { error: orderError?.message ?? 'Could not create order' }
  }

  const orderItems = items.map((i) => ({
    oi_order_id: order.ord_id,
    oi_dish_id: i.dishId,
    oi_quantity: i.quantity,
    oi_unit_price: i.price,
    oi_subtotal: i.price * i.quantity,
  }))

  const { error: itemsError } = await supabase.from('tbl_order_items').insert(orderItems)

  if (itemsError) {
    return { error: itemsError.message }
  }

  // Cart is cleared client-side on the tracking page (see ClearCartOnMount)
  redirect(`/orders/${order.ord_id}/track`)
}
