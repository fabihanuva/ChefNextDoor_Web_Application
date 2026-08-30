import { createClient } from '@/lib/supabase/server'
import { OrderQueueItem } from '@/components/chef/OrderQueueItem'
import { EmptyState } from '@/components/shared/EmptyState'
import { getChefId, getChefOrderIds } from '@/lib/actions/chef-helpers'

export default async function ChefOrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const chefId = await getChefId(supabase, user.id)
  const orderIds = chefId ? await getChefOrderIds(supabase, chefId) : []

  const { data: orders } = orderIds.length
    ? await supabase
        .from('tbl_order')
        .select('*')
        .in('ord_id', orderIds)
        .not('ord_status', 'in', '("delivered","cancelled")')
        .order('ord_order_date', { ascending: true })
    : { data: [] }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Incoming orders</h1>

      <div className="space-y-3">
        {orders?.map((order) => (
          <OrderQueueItem key={order.ord_id} order={order} />
        ))}
        {orders?.length === 0 && (
          <EmptyState
            emoji="📭"
            title="No active orders"
            message="New orders will show up here the moment a customer checks out."
          />
        )}
      </div>
    </div>
  )
}
