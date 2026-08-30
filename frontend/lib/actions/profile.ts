'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCustomerId } from './customer-helpers'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  defaultAddress: z.string().optional(),
})

export type ProfileState = { error?: string; success?: boolean } | undefined

async function deleteOldAvatar(
  supabase: Awaited<ReturnType<typeof createClient>>,
  currentUrl: string | null
) {
  if (!currentUrl) return
  const marker = '/customer-avatars/'
  const index = currentUrl.indexOf(marker)
  if (index === -1) return

  const path = currentUrl.slice(index + marker.length)
  try {
    await supabase.storage.from('customer-avatars').remove([path])
  } catch {
    // non-fatal — old file just stays orphaned in storage
  }
}

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    defaultAddress: formData.get('defaultAddress') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in' }

  const removeAvatar = formData.get('removeAvatar') === 'true'
  const avatarFile = formData.get('avatar')
  const hasNewFile = avatarFile instanceof File && avatarFile.size > 0

  const avatarUpdate: { usr_profile_image?: string | null } = {}

  if (hasNewFile || removeAvatar) {
    const { data: currentProfile } = await supabase
      .from('tbl_users')
      .select('usr_profile_image')
      .eq('usr_id', user.id)
      .single()

    await deleteOldAvatar(supabase, currentProfile?.usr_profile_image ?? null)

    if (hasNewFile) {
      const file = avatarFile as File
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('customer-avatars')
        .upload(path, file, { cacheControl: '3600', upsert: true })

      if (uploadError) return { error: uploadError.message }

      const { data } = supabase.storage.from('customer-avatars').getPublicUrl(path)
      avatarUpdate.usr_profile_image = data.publicUrl
    } else {
      avatarUpdate.usr_profile_image = null
    }
  }

  const { error } = await supabase
    .from('tbl_users')
    .update({
      usr_full_name: parsed.data.fullName,
      usr_phone: parsed.data.phone,
      ...avatarUpdate,
    })
    .eq('usr_id', user.id)

  if (error) return { error: error.message }

  const customerId = await getCustomerId(supabase, user.id)
  if (customerId) {
    const { error: addressError } = await supabase
      .from('tbl_customer')
      .update({ cs_default_address: parsed.data.defaultAddress ?? null })
      .eq('cs_id', customerId)

    if (addressError) return { error: addressError.message }
  }

  revalidatePath('/profile')
  return { success: true }
}
