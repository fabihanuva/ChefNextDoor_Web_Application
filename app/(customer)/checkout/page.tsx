import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/customer/CheckoutForm'
import { getCustomerId } from '@/lib/actions/customer-helpers'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: paymentMethods } = await supabase
    .from('tbl_payment_method')
    .select('pm_id, pm_name')
    .eq('pm_is_active', true)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let defaultAddress = ''
  if (user) {
    const customerId = await getCustomerId(supabase, user.id)
    if (customerId) {
      const { data: customer } = await supabase
        .from('tbl_customer')
        .select('cs_default_address')
        .eq('cs_id', customerId)
        .single()
      defaultAddress = customer?.cs_default_address ?? ''
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Checkout</h1>
      <CheckoutForm paymentMethods={paymentMethods ?? []} defaultAddress={defaultAddress} />
    </div>
  )
}
