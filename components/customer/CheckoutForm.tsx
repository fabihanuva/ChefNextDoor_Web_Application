'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/customer/CartProvider'
import { Button } from '@/components/shared/Button'
import { formatCurrency } from '@/lib/utils'
import { activeDeliveryFeeStrategy } from '@/lib/strategies/deliveryFee'
import { placeOrder, type PlaceOrderState } from '@/lib/actions/order'

type PaymentMethod = { pm_id: number; pm_name: string }

export function CheckoutForm({ paymentMethods }: { paymentMethods: PaymentMethod[] }) {
  const { items, subtotal } = useCart()
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<PlaceOrderState, FormData>(
    placeOrder,
    undefined
  )

  const deliveryFee = activeDeliveryFeeStrategy({ subtotal, distanceKm: 3 })
  const total = subtotal + deliveryFee

  useEffect(() => {
    if (items.length === 0) router.replace('/browse')
  }, [items, router])

  if (items.length === 0) return null

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="cartPayload" value={JSON.stringify(items)} />
      <input type="hidden" name="deliveryFee" value={deliveryFee} />

      <div>
        <label className="text-sm font-medium text-gray-700">Delivery address</label>
        <textarea
          name="deliveryAddress"
          required
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Payment method</label>
        <select
          name="paymentMethodId"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <option value="" disabled>
            Select a payment method
          </option>
          {paymentMethods.map((pm) => (
            <option key={pm.pm_id} value={pm.pm_id}>
              {pm.pm_name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-mono">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery fee</span>
          <span className="font-mono">{formatCurrency(deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-gray-900 font-medium text-base pt-1">
          <span>Total</span>
          <span className="font-mono text-brand-green">{formatCurrency(total)}</span>
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? 'Placing order...' : 'Place order'}
      </Button>
    </form>
  )
}
