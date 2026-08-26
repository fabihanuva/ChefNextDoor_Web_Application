'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from './requireAdmin'

const supportContentSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  content: z.string().min(2, 'Content is required'),
})

export type SupportContentState = { error?: string } | undefined

export async function createSupportContent(
  _prevState: SupportContentState,
  formData: FormData
): Promise<SupportContentState> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const parsed = supportContentSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })

  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = createAdminClient()
  const { error } = await supabase.from('tbl_support_content').insert({
    sc_title: parsed.data.title,
    sc_content: parsed.data.content,
    sc_admin_id: admin.adm_id,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/support-content')
  redirect('/admin/support-content')
}

export async function deleteSupportContent(contentId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorized' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('tbl_support_content').delete().eq('sc_id', contentId)

  if (error) return { error: error.message }

  revalidatePath('/admin/support-content')
  return { error: undefined }
}
