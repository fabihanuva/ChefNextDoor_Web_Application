import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { OrderStatusBadge } from '@/components/shared/Badge'
import { getCustomerId } from '@/lib/actions/customer-helpers'
import { formatCurrency } from '@/lib/utils'

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const customerId = await getCustomerId(supabase, user.id)

  const { data: orders } = customerId
    ? await supabase
        .from('tbl_order')
        .select('*')
        .eq('ord_customer_id', customerId)
        .order('ord_order_date', { ascending: false })
    : { data: [] }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Your orders</h1>

      <div className="space-y-3">
        {orders?.map((order) => (
          <Link
            key={order.ord_id}
            href={`/orders/${order.ord_id}/track`}
            className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition"
          >
            <div>
              <p className="font-medium text-gray-900 font-mono text-sm">#{order.ord_id}</p>
              <p className="text-sm text-gray-500 font-mono">
                {formatCurrency(Number(order.ord_total_amount))}
              </p>
            </div>
            <OrderStatusBadge status={order.ord_status} />
          </Link>
        ))}
        {orders?.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            You haven&apos;t placed any orders yet.
          </p>
        )}
      </div>
    </div>
  )
}
