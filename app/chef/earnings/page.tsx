import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { getChefId, getChefOrderIds } from '@/lib/actions/chef-helpers'

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

  const totalRevenue =
    deliveredOrders?.reduce((sum, o) => sum + Number(o.ord_total_amount ?? 0), 0) ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-2">Earnings</h1>
      <p className="text-gray-500 mb-6">From {deliveredOrders?.length ?? 0} completed orders</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <p className="text-sm text-gray-500">Total revenue</p>
        <p className="font-display text-3xl text-brand-green mt-1">
          {formatCurrency(totalRevenue)}
        </p>
      </div>

      <div className="space-y-2">
        {deliveredOrders?.map((order) => (
          <div
            key={order.ord_id}
            className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4"
          >
            <span className="font-mono text-sm text-gray-500">#{order.ord_id}</span>
            <span className="font-mono text-brand-green">
              {formatCurrency(Number(order.ord_total_amount))}
            </span>
          </div>
        ))}
        {deliveredOrders?.length === 0 && (
          <p className="text-gray-500 text-center py-12">No completed orders yet.</p>
        )}
      </div>
    </div>
  )
}
