import {
  flatRateStrategy,
  distanceBasedStrategy,
  freeOverThresholdStrategy,
  activeDeliveryFeeStrategy,
} from '@/lib/strategies/deliveryFee'

describe('flatRateStrategy', () => {
  it('always charges the same flat fee regardless of inputs', () => {
    expect(flatRateStrategy({ subtotal: 5, distanceKm: 1 })).toBe(40)
    expect(flatRateStrategy({ subtotal: 500, distanceKm: 50 })).toBe(40)
  })
})

describe('distanceBasedStrategy', () => {
  it('charges the base fee at zero distance', () => {
    expect(distanceBasedStrategy({ subtotal: 10, distanceKm: 0 })).toBe(30)
  })

  it('adds per-km cost on top of the base fee', () => {
    // base 30 + 12 * 4 = 78
    expect(distanceBasedStrategy({ subtotal: 10, distanceKm: 4 })).toBe(78)
  })

  it('rounds the result to two decimal places', () => {
    // base 30 + 12 * 3.333 = 69.996 -> 70
    const fee = distanceBasedStrategy({ subtotal: 10, distanceKm: 3.333 })
    expect(fee).toBe(Math.round((30 + 12 * 3.333) * 100) / 100)
  })
})

describe('freeOverThresholdStrategy', () => {
  it('is free once the subtotal meets the threshold', () => {
    expect(freeOverThresholdStrategy({ subtotal: 800, distanceKm: 10 })).toBe(0)
  })

  it('is free above the threshold too', () => {
    expect(freeOverThresholdStrategy({ subtotal: 1000, distanceKm: 10 })).toBe(0)
  })

  it('falls back to the distance-based fee below the threshold', () => {
    const subtotal = 20
    const distanceKm = 2
    expect(freeOverThresholdStrategy({ subtotal, distanceKm })).toBe(
      distanceBasedStrategy({ subtotal, distanceKm })
    )
  })

  it('treats the boundary (subtotal just under threshold) as chargeable', () => {
    const result = freeOverThresholdStrategy({ subtotal: 799.99, distanceKm: 1 })
    expect(result).toBeGreaterThan(0)
  })
})

describe('activeDeliveryFeeStrategy', () => {
  it('is wired to the free-over-threshold strategy', () => {
    expect(activeDeliveryFeeStrategy).toBe(freeOverThresholdStrategy)
  })
})
