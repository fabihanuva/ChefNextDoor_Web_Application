import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClearCartOnMount } from '@/components/customer/ClearCartOnMount'
import { OrderTrackerView } from '@/components/customer/OrderTrackerView'
import { ReviewForm } from '@/components/customer/ReviewForm'
import { getOrderReview } from '@/lib/actions/review'

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

  const existingReview =
    order.ord_status === 'delivered' ? await getOrderReview(order.ord_id) : null

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <ClearCartOnMount />
      <h1 className="font-display text-3xl text-gray-900 mb-6">Track your order</h1>
      <OrderTrackerView
        orderId={order.ord_id}
        initialStatus={order.ord_status}
        total={Number(order.ord_total_amount)}
      />

      {order.ord_status === 'delivered' && !existingReview && (
        <ReviewForm orderId={order.ord_id} />
      )}

      {existingReview && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
          <p className="font-medium text-gray-900 mb-1">Your review</p>
          <p className="text-brand-gold">{'★'.repeat(existingReview.rv_rating)}</p>
          {existingReview.rv_comment && (
            <p className="text-sm text-gray-600 mt-2">{existingReview.rv_comment}</p>
          )}
        </div>
      )}
    </div>
  )
}
