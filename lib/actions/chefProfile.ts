'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const chefProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  cuisineType: z.string().min(2, 'Tell customers what you cook'),
  kitchenAddress: z.string().min(5, 'Enter your kitchen address'),
  bio: z.string().optional(),
})

export type ChefProfileState = { error?: string; success?: boolean } | undefined

/**
 * Best-effort deletion of the old avatar file from Storage when it's
 * being replaced or removed. Wrapped so a storage hiccup never blocks
 * the actual profile update — leftover files are a cleanliness issue,
 * not a correctness one.
 */
async function deleteOldAvatar(
  supabase: Awaited<ReturnType<typeof createClient>>,
  currentUrl: string | null
) {
  if (!currentUrl) return
  const marker = '/chef-avatars/'
  const index = currentUrl.indexOf(marker)
  if (index === -1) return

  const path = currentUrl.slice(index + marker.length)
  try {
    await supabase.storage.from('chef-avatars').remove([path])
  } catch {
    // non-fatal — old file just stays orphaned in storage
  }
}

export async function updateChefProfile(
  _prevState: ChefProfileState,
  formData: FormData
): Promise<ChefProfileState> {
  const parsed = chefProfileSchema.safeParse({
    fullName: formData.get('fullName'),
    cuisineType: formData.get('cuisineType'),
    kitchenAddress: formData.get('kitchenAddress'),
    bio: formData.get('bio') || undefined,
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

  // avatarUpdate stays empty when neither a new file nor removal was
  // requested, so the existing photo is left untouched.
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
        .from('chef-avatars')
        .upload(path, file, { cacheControl: '3600', upsert: true })

      if (uploadError) return { error: uploadError.message }

      const { data } = supabase.storage.from('chef-avatars').getPublicUrl(path)
      avatarUpdate.usr_profile_image = data.publicUrl
    } else {
      // removeAvatar was checked and no new file was chosen
      avatarUpdate.usr_profile_image = null
    }
  }

  const { error: userError } = await supabase
    .from('tbl_users')
    .update({
      usr_full_name: parsed.data.fullName,
      ...avatarUpdate,
    })
    .eq('usr_id', user.id)

  if (userError) return { error: userError.message }

  const { error: chefError } = await supabase
    .from('tbl_chef_profile')
    .update({
      chf_cuisine_type: parsed.data.cuisineType,
      chf_kitchen_address: parsed.data.kitchenAddress,
      chf_bio: parsed.data.bio ?? null,
    })
    .eq('chf_user_id', user.id)

  if (chefError) return { error: chefError.message }

  revalidatePath('/chef/profile')
  return { success: true }
}
