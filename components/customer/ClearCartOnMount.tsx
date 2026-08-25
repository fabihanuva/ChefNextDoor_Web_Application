'use client'

import { useEffect } from 'react'
import { useCart } from './CartProvider'

/**
 * Rendered on the order-tracking page after a successful checkout.
 * Since placeOrder() redirects server-side, the cart can't be cleared
 * inside the server action — this runs once on the client after landing
 * on the confirmation page instead.
 */
export function ClearCartOnMount() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
