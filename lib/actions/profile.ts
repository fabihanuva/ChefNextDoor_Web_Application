'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  phone: z.string().min(6, 'Enter a valid phone number'),
})

export type ProfileState = { error?: string; success?: boolean } | undefined

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in' }

  const { error } = await supabase
    .from('tbl_users')
    .update({ usr_full_name: parsed.data.fullName, usr_phone: parsed.data.phone })
    .eq('usr_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}
