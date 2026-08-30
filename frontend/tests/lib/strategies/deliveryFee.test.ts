import {
  flatRateStrategy,
  distanceBasedStrategy,
  freeOverThresholdStrategy,
  activeDeliveryFeeStrategy,
} from '@/lib/strategies/deliveryFee'

describe('flatRateStrategy', () => {
  it('always charges the same flat fee regardless of inputs', () => {
    expect(flatRateStrategy({ subtotal: 5, distanceKm: 1 })).toBe(2.99)
    expect(flatRateStrategy({ subtotal: 500, distanceKm: 50 })).toBe(2.99)
  })
})

describe('distanceBasedStrategy', () => {
  it('charges the base fee at zero distance', () => {
    expect(distanceBasedStrategy({ subtotal: 10, distanceKm: 0 })).toBe(1.5)
  })

  it('adds per-km cost on top of the base fee', () => {
    // base 1.5 + 0.5 * 4 = 3.5
    expect(distanceBasedStrategy({ subtotal: 10, distanceKm: 4 })).toBe(3.5)
  })

  it('rounds the result to two decimal places', () => {
    // base 1.5 + 0.5 * 3.333 = 3.1665 -> 3.17 (or 3.16 depending on FP rounding)
    const fee = distanceBasedStrategy({ subtotal: 10, distanceKm: 3.333 })
    expect(fee).toBe(Math.round((1.5 + 0.5 * 3.333) * 100) / 100)
  })
})

describe('freeOverThresholdStrategy', () => {
  it('is free once the subtotal meets the threshold', () => {
    expect(freeOverThresholdStrategy({ subtotal: 30, distanceKm: 10 })).toBe(0)
  })

  it('is free above the threshold too', () => {
    expect(freeOverThresholdStrategy({ subtotal: 100, distanceKm: 10 })).toBe(0)
  })

  it('falls back to the distance-based fee below the threshold', () => {
    const subtotal = 20
    const distanceKm = 2
    expect(freeOverThresholdStrategy({ subtotal, distanceKm })).toBe(
      distanceBasedStrategy({ subtotal, distanceKm })
    )
  })

  it('treats the boundary (subtotal just under threshold) as chargeable', () => {
    const result = freeOverThresholdStrategy({ subtotal: 29.99, distanceKm: 1 })
    expect(result).toBeGreaterThan(0)
  })
})

describe('activeDeliveryFeeStrategy', () => {
  it('is wired to the free-over-threshold strategy', () => {
    expect(activeDeliveryFeeStrategy).toBe(freeOverThresholdStrategy)
  })
})
