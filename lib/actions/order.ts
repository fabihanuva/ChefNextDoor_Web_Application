'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { activeDeliveryFeeStrategy, FALLBACK_DISTANCE_KM } from '@/lib/strategies/deliveryFee'
import { geocodeAddress, haversineDistanceKm } from '@/lib/geocoding'
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

  // Real distance: geocode the delivery address and compare against the
  // chef's stored kitchen coordinates (set whenever they save their
  // profile — see lib/actions/chefProfile.ts). Falls back to a fixed
  // estimate if either address can't be geocoded, so checkout never
  // blocks on a third-party API hiccup.
  const chefId = items[0].chefId
  const { data: chefProfile } = await supabase
    .from('tbl_chef_profile')
    .select('chf_latitude, chf_longitude')
    .eq('chf_id', chefId)
    .single()

  let distanceKm = FALLBACK_DISTANCE_KM
  if (chefProfile?.chf_latitude && chefProfile?.chf_longitude) {
    const customerCoords = await geocodeAddress(deliveryAddress)
    if (customerCoords) {
      distanceKm = haversineDistanceKm(
        Number(chefProfile.chf_latitude),
        Number(chefProfile.chf_longitude),
        customerCoords.lat,
        customerCoords.lng
      )
    }
  }

  const deliveryFee = activeDeliveryFeeStrategy({ subtotal, distanceKm })
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
