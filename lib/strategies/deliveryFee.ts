/**
 * Strategy pattern (carried over from your PHP implementation):
 * interchangeable delivery-fee calculation strategies. Swap which
 * strategy is active for checkout without touching checkout logic itself.
 */
export type DeliveryFeeStrategy = (params: {
  subtotal: number
  distanceKm: number
}) => number

export const flatRateStrategy: DeliveryFeeStrategy = () => 2.99

export const distanceBasedStrategy: DeliveryFeeStrategy = ({ distanceKm }) => {
  const base = 1.5
  const perKm = 0.5
  return Math.round((base + perKm * distanceKm) * 100) / 100
}

export const freeOverThresholdStrategy: DeliveryFeeStrategy = ({ subtotal, distanceKm }) => {
  if (subtotal >= 30) return 0
  return distanceBasedStrategy({ subtotal, distanceKm })
}

// Change this one line to swap the active strategy platform-wide.
export const activeDeliveryFeeStrategy: DeliveryFeeStrategy = freeOverThresholdStrategy
