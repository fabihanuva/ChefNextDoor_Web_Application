'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteDeliveryPartner } from '@/lib/actions/adminDeliveryPartners'

export function DeliveryPartnerRow({
  partner,
}: {
  partner: { dp_id: number; dp_full_name: string; dp_phone: string; dp_vehicle_type: string | null }
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
      <div>
        <p className="font-medium text-gray-900">{partner.dp_full_name}</p>
        <p className="text-sm text-gray-500">
          {partner.dp_phone} · {partner.dp_vehicle_type}
        </p>
      </div>
      <button
        onClick={() => {
          if (confirm(`Remove ${partner.dp_full_name}?`)) {
            startTransition(() => deleteDeliveryPartner(partner.dp_id))
          }
        }}
        disabled={isPending}
        className="text-gray-400 hover:text-red-600"
        aria-label="Remove delivery partner"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}
