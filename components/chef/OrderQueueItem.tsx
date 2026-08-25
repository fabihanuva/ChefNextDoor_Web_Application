'use client'

import { useTransition } from 'react'
import { OrderStatusBadge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { updateOrderStatus } from '@/lib/actions/chefOrder'
import { formatCurrency } from '@/lib/utils'

const NEXT_STATUS: Record<string, string | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
  delivered: null,
}

const NEXT_LABEL: Record<string, string> = {
  pending: 'Confirm order',
  confirmed: 'Start preparing',
  preparing: 'Mark out for delivery',
  out_for_delivery: 'Mark delivered',
}

export function OrderQueueItem({
  order,
}: {
  order: {
    ord_id: number
    ord_status: string
    ord_total_amount: number | string
    ord_delivery_address: string
  }
}) {
  const [isPending, startTransition] = useTransition()
  const nextStatus = NEXT_STATUS[order.ord_status]

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 font-mono">#{order.ord_id}</span>
        <OrderStatusBadge status={order.ord_status} />
      </div>

      <p className="text-sm text-gray-600 mb-3">{order.ord_delivery_address}</p>

      <div className="flex items-center justify-between">
        <span className="font-mono text-brand-green font-medium">
          {formatCurrency(Number(order.ord_total_amount))}
        </span>

        <div className="flex gap-2">
          {nextStatus && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() =>
                startTransition(() => {
                  updateOrderStatus(order.ord_id, nextStatus)
                })
              }
            >
              {NEXT_LABEL[order.ord_status]}
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                updateOrderStatus(order.ord_id, 'cancelled')
              })
            }
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
