'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from './requireAdmin'
import {
  sendChefApprovedEmail,
  sendChefRejectedEmail,
  sendChefSuspendedEmail,
} from '@/lib/email/mailer'

async function getChefContact(
  supabase: ReturnType<typeof createAdminClient>,
  chefId: number
) {
  const { data } = await supabase
    .from('tbl_chef_profile')
    .select('tbl_users(usr_full_name, usr_email)')
    .eq('chf_id', chefId)
    .single<{ tbl_users: { usr_full_name: string; usr_email: string } | null }>()

  return data?.tbl_users ?? null
}

export async function approveChef(chefId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const supabase = createAdminClient()
  const contact = await getChefContact(supabase, chefId)

  const { error } = await supabase
    .from('tbl_chef_profile')
    .update({ chf_verification_status: 'verified' })
    .eq('chf_id', chefId)

  if (error) return { error: error.message }

  if (contact) {
    await sendChefApprovedEmail(contact.usr_email, contact.usr_full_name)
  }

  revalidatePath('/admin/chefs')
  return { error: undefined }
}

export async function rejectChef(chefId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const supabase = createAdminClient()
  const contact = await getChefContact(supabase, chefId)

  const { error } = await supabase
    .from('tbl_chef_profile')
    .update({ chf_verification_status: 'rejected' })
    .eq('chf_id', chefId)

  if (error) return { error: error.message }

  if (contact) {
    await sendChefRejectedEmail(contact.usr_email, contact.usr_full_name)
  }

  revalidatePath('/admin/chefs')
  return { error: undefined }
}

export async function suspendChef(chefId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const supabase = createAdminClient()
  const contact = await getChefContact(supabase, chefId)

  const { error } = await supabase
    .from('tbl_chef_profile')
    .update({ chf_verification_status: 'suspended' })
    .eq('chf_id', chefId)

  if (error) return { error: error.message }

  if (contact) {
    await sendChefSuspendedEmail(contact.usr_email, contact.usr_full_name)
  }

  revalidatePath('/admin/chefs')
  return { error: undefined }
}
