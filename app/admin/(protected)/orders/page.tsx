import { createAdminClient } from '@/lib/supabase/admin'
import { OrderStatusBadge } from '@/components/shared/Badge'
import { formatCurrency } from '@/lib/utils'

export default async function AdminOrdersPage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('tbl_order')
    .select('*')
    .order('ord_order_date', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="font-display text-2xl text-gray-900 mb-6">All orders</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.ord_id} className="border-t border-gray-100">
                <td className="px-4 py-2 font-mono">#{order.ord_id}</td>
                <td className="px-4 py-2 font-mono">
                  {formatCurrency(Number(order.ord_total_amount))}
                </td>
                <td className="px-4 py-2">
                  <OrderStatusBadge status={order.ord_status} />
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(order.ord_order_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders?.length === 0 && (
          <p className="text-gray-500 text-center py-12">No orders yet.</p>
        )}
      </div>
    </div>
  )
}
