import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClearCartOnMount } from '@/components/customer/ClearCartOnMount'
import { OrderTrackerView } from '@/components/customer/OrderTrackerView'

export default async function OrderTrackPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('tbl_order')
    .select('*')
    .eq('ord_id', orderId)
    .single()

  if (!order) notFound()

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <ClearCartOnMount />
      <h1 className="font-display text-3xl text-gray-900 mb-6">Track your order</h1>
      <OrderTrackerView
        orderId={order.ord_id}
        initialStatus={order.ord_status}
        total={Number(order.ord_total_amount)}
      />
    </div>
  )
}
