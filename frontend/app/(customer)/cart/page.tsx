'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/components/customer/CartProvider'
import { Button } from '@/components/shared/Button'
import { formatCurrency } from '@/lib/utils'

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link href="/browse" className="inline-block mt-4">
          <Button>Browse chefs</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Your cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.dishId}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4"
          >
            <div className="relative w-16 h-16 rounded-lg bg-brand-cream overflow-hidden shrink-0">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              )}
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500 font-mono">{formatCurrency(item.price)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                className="p-1 rounded border border-gray-300 hover:bg-gray-50"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                className="p-1 rounded border border-gray-300 hover:bg-gray-50"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={() => removeItem(item.dishId)}
              className="text-gray-400 hover:text-red-600"
              aria-label="Remove item"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
        <span className="font-medium text-gray-900">Subtotal</span>
        <span className="font-mono text-lg text-brand-green">{formatCurrency(subtotal)}</span>
      </div>

      <Link href="/checkout" className="block mt-6">
        <Button className="w-full" size="lg">
          Proceed to checkout
        </Button>
      </Link>
    </div>
  )
}
