'use client'

import { useRealtimeOrder } from '@/hooks/useRealtimeOrder'
import { OrderStatusBadge } from '@/components/shared/Badge'
import { formatCurrency } from '@/lib/utils'

const STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

export function OrderTrackerView({
  orderId,
  initialStatus,
  total,
}: {
  orderId: number
  initialStatus: string
  total: number
}) {
  const status = useRealtimeOrder(orderId, initialStatus)
  const currentStep = STEPS.indexOf(status)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500 font-mono">Order #{orderId}</span>
        <OrderStatusBadge status={status} />
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                i <= currentStep ? 'bg-brand-green' : 'bg-gray-200'
              }`}
            />
            <span
              className={`text-sm ${
                i <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-400'
              }`}
            >
              {step.replace(/_/g, ' ')}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
        <span className="text-gray-600 text-sm">Total</span>
        <span className="font-mono text-brand-green font-medium">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
