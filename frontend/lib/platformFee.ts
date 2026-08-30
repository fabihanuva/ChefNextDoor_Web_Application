/**
 * The platform's cut of every order. Change this one number to adjust
 * it everywhere — chef earnings, chef dashboard, and admin revenue all
 * derive from this same constant, so they can never drift out of sync
 * with each other.
 *
 * Note: this is computed at display time, not stored per-order. If you
 * change PLATFORM_FEE_PERCENT later, it recalculates historical earnings
 * under the new rate too (it doesn't lock in the rate that applied when
 * each order was actually placed). For this project that's an acceptable
 * simplification — a production system would persist the fee amount on
 * tbl_order at checkout time instead.
 */
export const PLATFORM_FEE_PERCENT = 0.1 // 10%

export function calculatePlatformFee(orderTotal: number): number {
  return Math.round(orderTotal * PLATFORM_FEE_PERCENT * 100) / 100
}

export function calculateChefEarnings(orderTotal: number): number {
  return Math.round((orderTotal - calculatePlatformFee(orderTotal)) * 100) / 100
}
