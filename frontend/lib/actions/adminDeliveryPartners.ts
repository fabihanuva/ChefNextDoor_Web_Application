'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from './requireAdmin'

const deliveryPartnerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  vehicleType: z.string().min(2, 'Vehicle type is required'),
})

export type DeliveryPartnerState = { error?: string } | undefined

export async function createDeliveryPartner(
  _prevState: DeliveryPartnerState,
  formData: FormData
): Promise<DeliveryPartnerState> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const parsed = deliveryPartnerSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    vehicleType: formData.get('vehicleType'),
  })

  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = createAdminClient()
  const { error } = await supabase.from('tbl_delivery_partner').insert({
    dp_full_name: parsed.data.name,
    dp_phone: parsed.data.phone,
    dp_vehicle_type: parsed.data.vehicleType,
    dp_admin_id: admin.adm_id,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/delivery-partners')
  redirect('/admin/delivery-partners')
}

export async function deleteDeliveryPartner(partnerId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('tbl_delivery_partner').delete().eq('dp_id', partnerId)

  if (error) return { error: error.message }

  revalidatePath('/admin/delivery-partners')
  return { error: undefined }
}
