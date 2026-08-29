/**
 * Strategy pattern (carried over from your PHP implementation):
 * interchangeable delivery-fee calculation strategies. Swap which
 * strategy is active for checkout without touching checkout logic itself.
 */
export type DeliveryFeeStrategy = (params: {
  subtotal: number
  distanceKm: number
}) => number

export const flatRateStrategy: DeliveryFeeStrategy = () => 40

export const distanceBasedStrategy: DeliveryFeeStrategy = ({ distanceKm }) => {
  const base = 30
  const perKm = 12
  return Math.round((base + perKm * distanceKm) * 100) / 100
}

export const freeOverThresholdStrategy: DeliveryFeeStrategy = ({ subtotal, distanceKm }) => {
  if (subtotal >= 800) return 0
  return distanceBasedStrategy({ subtotal, distanceKm })
}

// Change this one line to swap the active strategy platform-wide.
export const activeDeliveryFeeStrategy: DeliveryFeeStrategy = freeOverThresholdStrategy

// Used whenever real geocoding fails (address not found, API timeout) —
// keeps checkout working instead of blocking the order.
export const FALLBACK_DISTANCE_KM = 5
