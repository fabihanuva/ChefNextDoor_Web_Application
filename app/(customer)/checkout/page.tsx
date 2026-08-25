import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/customer/CheckoutForm'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: paymentMethods } = await supabase
    .from('tbl_payment_method')
    .select('pm_id, pm_name')
    .eq('pm_is_active', true)

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Checkout</h1>
      <CheckoutForm paymentMethods={paymentMethods ?? []} />
    </div>
  )
}
