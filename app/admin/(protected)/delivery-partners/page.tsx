import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/shared/Button'
import { DeliveryPartnerRow } from '@/components/admin/DeliveryPartnerRow'

export default async function AdminDeliveryPartnersPage() {
  const supabase = createAdminClient()
  const { data: partners } = await supabase
    .from('tbl_delivery_partner')
    .select('*')
    .order('dp_full_name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-gray-900">Delivery partners</h1>
        <Link href="/admin/delivery-partners/new">
          <Button>Add partner</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {partners?.map((p) => (
          <DeliveryPartnerRow key={p.dp_id} partner={p} />
        ))}
        {partners?.length === 0 && <p className="text-gray-500">No delivery partners yet.</p>}
      </div>
    </div>
  )
}
