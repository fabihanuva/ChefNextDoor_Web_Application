import { createAdminClient } from '@/lib/supabase/admin'
import { formatCurrency } from '@/lib/utils'
import { calculatePlatformFee, PLATFORM_FEE_PERCENT } from '@/lib/platformFee'

/**
 * NOTE: tbl_order only persists ord_total_amount (the combined order
 * total) — delivery fee was never stored as a separate column (see
 * Phase 7's placeOrder action). Platform revenue below is computed as
 * PLATFORM_FEE_PERCENT of that total, not a separately-tracked figure.
 */
export default async function AdminRevenuePage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('tbl_order')
    .select('ord_total_amount, ord_order_date, ord_status')
    .eq('ord_status', 'delivered')
    .order('ord_order_date', { ascending: false })

  const gmv = orders?.reduce((sum, o) => sum + Number(o.ord_total_amount ?? 0), 0) ?? 0
  const platformRevenue = calculatePlatformFee(gmv)
  const chefPayouts = gmv - platformRevenue

  const byMonth = new Map<string, number>()
  orders?.forEach((o) => {
    const month = new Date(o.ord_order_date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
    byMonth.set(month, (byMonth.get(month) ?? 0) + Number(o.ord_total_amount ?? 0))
  })

  return (
    <div>
      <h1 className="font-display text-2xl text-gray-900 mb-2">Revenue</h1>
      <p className="text-sm text-gray-500 mb-6">
        Platform revenue is {(PLATFORM_FEE_PERCENT * 100).toFixed(0)}% of order value from
        delivered orders. Delivery fees aren&apos;t tracked as a separate figure yet.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total order value (GMV)</p>
          <p className="font-display text-xl text-gray-900 mt-1">{formatCurrency(gmv)}</p>
        </div>
        <div className="bg-brand-green rounded-xl p-5 shadow-sm">
          <p className="text-sm text-white/80">Platform revenue</p>
          <p className="font-display text-xl text-white mt-1">{formatCurrency(platformRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Paid out to chefs</p>
          <p className="font-display text-xl text-gray-900 mt-1">{formatCurrency(chefPayouts)}</p>
        </div>
      </div>

      <h2 className="font-display text-lg text-gray-900 mb-3">Order value by month</h2>
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
        {Array.from(byMonth.entries()).map(([month, total]) => (
          <div key={month} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-600">{month}</span>
            <div className="text-right">
              <span className="font-mono text-sm text-gray-900">{formatCurrency(total)}</span>
              <span className="font-mono text-xs text-gray-400 ml-3">
                ({formatCurrency(calculatePlatformFee(total))} platform)
              </span>
            </div>
          </div>
        ))}
        {byMonth.size === 0 && (
          <p className="text-gray-500 text-center py-12">No delivered orders yet.</p>
        )}
      </div>
    </div>
  )
}
