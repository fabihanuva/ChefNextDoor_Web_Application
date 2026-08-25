'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

/**
 * A chef's display name and photo live on tbl_users (usr_full_name /
 * usr_profile_image) — the same columns a customer profile uses. There
 * is no chef_business_name / chef_avatar_url in the real schema.
 * chf_kitchen_address is NOT NULL, so it's editable here too, not just
 * at signup.
 */
const chefProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  cuisineType: z.string().min(2, 'Tell customers what you cook'),
  kitchenAddress: z.string().min(5, 'Enter your kitchen address'),
  bio: z.string().optional(),
})

export type ChefProfileState = { error?: string; success?: boolean } | undefined

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

  let avatarUrl: string | undefined
  const avatarFile = formData.get('avatar')
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('chef-avatars')
      .upload(path, avatarFile, { cacheControl: '3600', upsert: true })

    if (uploadError) return { error: uploadError.message }

    const { data } = supabase.storage.from('chef-avatars').getPublicUrl(path)
    avatarUrl = data.publicUrl
  }

  const { error: userError } = await supabase
    .from('tbl_users')
    .update({
      usr_full_name: parsed.data.fullName,
      ...(avatarUrl ? { usr_profile_image: avatarUrl } : {}),
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
