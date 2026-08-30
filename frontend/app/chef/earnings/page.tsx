import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { getChefId, getChefOrderIds } from '@/lib/actions/chef-helpers'
import { calculatePlatformFee, calculateChefEarnings, PLATFORM_FEE_PERCENT } from '@/lib/platformFee'

export default async function ChefEarningsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const chefId = await getChefId(supabase, user.id)
  const orderIds = chefId ? await getChefOrderIds(supabase, chefId) : []

  const { data: deliveredOrders } = orderIds.length
    ? await supabase
        .from('tbl_order')
        .select('ord_id, ord_total_amount, ord_order_date')
        .in('ord_id', orderIds)
        .eq('ord_status', 'delivered')
        .order('ord_order_date', { ascending: false })
    : { data: [] }

  const grossTotal =
    deliveredOrders?.reduce((sum, o) => sum + Number(o.ord_total_amount ?? 0), 0) ?? 0
  const feeTotal = calculatePlatformFee(grossTotal)
  const netTotal = calculateChefEarnings(grossTotal)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-2">Earnings</h1>
      <p className="text-gray-500 mb-6">From {deliveredOrders?.length ?? 0} completed orders</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Gross sales</p>
          <p className="font-display text-xl text-gray-900 mt-1">{formatCurrency(grossTotal)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Platform fee ({(PLATFORM_FEE_PERCENT * 100).toFixed(0)}%)</p>
          <p className="font-display text-xl text-gray-500 mt-1">−{formatCurrency(feeTotal)}</p>
        </div>
        <div className="bg-brand-green rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-white/80">Your earnings</p>
          <p className="font-display text-xl text-white mt-1">{formatCurrency(netTotal)}</p>
        </div>
      </div>

      <div className="space-y-2">
        {deliveredOrders?.map((order) => {
          const orderTotal = Number(order.ord_total_amount)
          return (
            <div
              key={order.ord_id}
              className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4"
            >
              <span className="font-mono text-sm text-gray-500">#{order.ord_id}</span>
              <div className="text-right">
                <p className="font-mono text-sm text-gray-400">{formatCurrency(orderTotal)}</p>
                <p className="font-mono text-brand-green font-medium">
                  {formatCurrency(calculateChefEarnings(orderTotal))}
                </p>
              </div>
            </div>
          )
        })}
        {deliveredOrders?.length === 0 && (
          <p className="text-gray-500 text-center py-12">No completed orders yet.</p>
        )}
      </div>
    </div>
  )
}
