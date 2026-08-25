'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartItem } from '@/lib/types'

const CART_STORAGE_KEY = 'chefnextdoor_cart'

type CartContextValue = {
  items: CartItem[]
  chefId: string | null
  addItem: (item: CartItem) => { ok: boolean; error?: string }
  removeItem: (dishId: string) => void
  updateQuantity: (dishId: string, quantity: number) => void
  clearCart: () => void
  subtotal: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

/**
 * Wraps the whole (customer) route group. Cart state lives in memory +
 * localStorage (this is real app code, not a Claude artifact, so
 * localStorage is fine here — it just replaces PHP's $_SESSION cart).
 *
 * Single-chef cart is enforced by design: adding a dish from a different
 * chef than what's already in the cart is rejected with a clear error,
 * matching your chef-first ordering flow.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {
        // ignore corrupt cart data
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, hydrated])

  const chefId = items[0]?.chefId ?? null

  function addItem(item: CartItem) {
    if (chefId && chefId !== item.chefId) {
      return {
        ok: false,
        error:
          'Your cart has dishes from another chef. Clear your cart to order from this chef instead.',
      }
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.dishId === item.dishId)
      if (existing) {
        return prev.map((i) =>
          i.dishId === item.dishId ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...prev, item]
    })

    return { ok: true }
  }

  function removeItem(dishId: string) {
    setItems((prev) => prev.filter((i) => i.dishId !== dishId))
  }

  function updateQuantity(dishId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(dishId)
      return
    }
    setItems((prev) => prev.map((i) => (i.dishId === dishId ? { ...i, quantity } : i)))
  }

  function clearCart() {
    setItems([])
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, chefId, addItem, removeItem, updateQuantity, clearCart, subtotal }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
