import { createAdminClient } from '@/lib/supabase/admin'
import { formatCurrency } from '@/lib/utils'

/**
 * NOTE: tbl_order only persists ord_total_amount (the combined total) —
 * subtotal and delivery fee were never stored as separate columns (see
 * Phase 7's placeOrder action). That means a real GMV-vs-delivery-fees
 * split isn't possible from existing data. This page shows total order
 * value only. If an accurate fee breakdown becomes a requirement, add a
 * persisted ord_delivery_fee column and start writing to it at checkout —
 * it just won't be retroactive for orders already placed.
 */
export default async function AdminRevenuePage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('tbl_order')
    .select('ord_total_amount, ord_order_date, ord_status')
    .eq('ord_status', 'delivered')
    .order('ord_order_date', { ascending: false })

  const totalRevenue =
    orders?.reduce((sum, o) => sum + Number(o.ord_total_amount ?? 0), 0) ?? 0

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
        Total order value from delivered orders. Delivery fees aren&apos;t tracked as a
        separate figure yet.
      </p>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-8 max-w-sm">
        <p className="text-sm text-gray-500">Total order value (delivered)</p>
        <p className="font-display text-2xl text-gray-900 mt-1">
          {formatCurrency(totalRevenue)}
        </p>
      </div>

      <h2 className="font-display text-lg text-gray-900 mb-3">By month</h2>
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
        {Array.from(byMonth.entries()).map(([month, total]) => (
          <div key={month} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-600">{month}</span>
            <span className="font-mono text-sm text-gray-900">{formatCurrency(total)}</span>
          </div>
        ))}
        {byMonth.size === 0 && (
          <p className="text-gray-500 text-center py-12">No delivered orders yet.</p>
        )}
      </div>
    </div>
  )
}
