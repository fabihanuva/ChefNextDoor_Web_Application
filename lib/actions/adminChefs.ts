'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from './requireAdmin'

export async function approveChef(chefId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('tbl_chef_profile')
    .update({ chf_verification_status: 'verified' })
    .eq('chf_id', chefId)

  if (error) return { error: error.message }

  revalidatePath('/admin/chefs')
  return { error: undefined }
}

export async function rejectChef(chefId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('tbl_chef_profile')
    .update({ chf_verification_status: 'rejected' })
    .eq('chf_id', chefId)

  if (error) return { error: error.message }

  revalidatePath('/admin/chefs')
  return { error: undefined }
}

export async function suspendChef(chefId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('tbl_chef_profile')
    .update({ chf_verification_status: 'suspended' })
    .eq('chf_id', chefId)

  if (error) return { error: error.message }

  revalidatePath('/admin/chefs')
  return { error: undefined }
}
