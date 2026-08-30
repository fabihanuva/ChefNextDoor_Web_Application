import {
  PLATFORM_FEE_PERCENT,
  calculatePlatformFee,
  calculateChefEarnings,
} from '@/lib/platformFee'

describe('PLATFORM_FEE_PERCENT', () => {
  it('is 10%', () => {
    expect(PLATFORM_FEE_PERCENT).toBe(0.1)
  })
})

describe('calculatePlatformFee', () => {
  it('takes 10% of the order total', () => {
    expect(calculatePlatformFee(100)).toBe(10)
  })

  it('rounds to two decimal places', () => {
    expect(calculatePlatformFee(19.99)).toBe(2)
  })

  it('returns 0 for a zero-value order', () => {
    expect(calculatePlatformFee(0)).toBe(0)
  })

  it('handles fractional totals without floating point drift', () => {
    expect(calculatePlatformFee(33.33)).toBe(3.33)
  })
})

describe('calculateChefEarnings', () => {
  it('is the order total minus the platform fee', () => {
    expect(calculateChefEarnings(100)).toBe(90)
  })

  it('stays consistent with calculatePlatformFee for the same total', () => {
    const total = 47.5
    const fee = calculatePlatformFee(total)
    expect(calculateChefEarnings(total)).toBe(Math.round((total - fee) * 100) / 100)
  })

  it('returns 0 for a zero-value order', () => {
    expect(calculateChefEarnings(0)).toBe(0)
  })
})
