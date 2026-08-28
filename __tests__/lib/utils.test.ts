import { cn, formatCurrency } from '@/lib/utils'

describe('cn', () => {
  it('merges class names into a single string', () => {
    expect(cn('p-2', 'text-sm')).toBe('p-2 text-sm')
  })

  it('lets a later Tailwind class override an earlier conflicting one', () => {
    // tailwind-merge should keep only the last padding utility
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('drops falsy values', () => {
    expect(cn('p-2', false, undefined, null, 'text-sm')).toBe('p-2 text-sm')
  })
})

describe('formatCurrency', () => {
  it('formats a whole number with the Taka symbol and two decimals', () => {
    expect(formatCurrency(500)).toBe('৳500.00')
  })

  it('formats a decimal amount rounded to two places', () => {
    expect(formatCurrency(1250.5)).toBe('৳1,250.50')
  })

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('৳0.00')
  })

  it('adds grouping separators for large amounts', () => {
    // Exact grouping (lakh-style vs. thousands) depends on the ICU data
    // bundled with the Node build running the tests, so assert the parts
    // that are guaranteed rather than one exact separator pattern.
    const result = formatCurrency(1000000)
    expect(result.startsWith('৳')).toBe(true)
    expect(result.endsWith('.00')).toBe(true)
    expect(result).toMatch(/,/)
  })
})
