'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from './requireAdmin'

export async function suspendUser(userId: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('tbl_users')
    .update({ usr_is_active: false })
    .eq('usr_id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { error: undefined }
}

export async function reactivateUser(userId: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('tbl_users')
    .update({ usr_is_active: true })
    .eq('usr_id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { error: undefined }
}
