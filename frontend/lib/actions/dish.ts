'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getChefId } from './chef-helpers'

const dishSchema = z.object({
  name: z.string().min(2, 'Dish name is required'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Enter a valid price'),
  isAvailable: z.coerce.boolean().default(true),
})

export type DishState = { error?: string } | undefined

async function uploadDishImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File
) {
  if (!file || file.size === 0) return null

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('dish-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('dish-images').getPublicUrl(path)
  return data.publicUrl
}

export async function createDish(
  _prevState: DishState,
  formData: FormData
): Promise<DishState> {
  const parsed = dishSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    price: formData.get('price'),
    isAvailable: formData.get('isAvailable') === 'on',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in' }

  const chefId = await getChefId(supabase, user.id)
  if (!chefId) return { error: 'Chef profile not found' }

  let imageUrl: string | null = null
  const file = formData.get('image') as File | null
  try {
    if (file) imageUrl = await uploadDishImage(supabase, user.id, file)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Image upload failed' }
  }

  const { error } = await supabase.from('tbl_dish').insert({
    dsh_chef_id: chefId,
    dsh_name: parsed.data.name,
    dsh_description: parsed.data.description ?? null,
    dsh_price: parsed.data.price,
    dsh_is_available: parsed.data.isAvailable,
    dsh_image_url: imageUrl,
  })

  if (error) return { error: error.message }

  revalidatePath('/chef/dishes')
  redirect('/chef/dishes')
}

export async function updateDish(
  dishId: string,
  _prevState: DishState,
  formData: FormData
): Promise<DishState> {
  const parsed = dishSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    price: formData.get('price'),
    isAvailable: formData.get('isAvailable') === 'on',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in' }

  const chefId = await getChefId(supabase, user.id)
  if (!chefId) return { error: 'Chef profile not found' }

  let imageUrl: string | undefined
  const file = formData.get('image') as File | null
  try {
    if (file && file.size > 0) {
      imageUrl = (await uploadDishImage(supabase, user.id, file)) ?? undefined
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Image upload failed' }
  }

  const { error } = await supabase
    .from('tbl_dish')
    .update({
      dsh_name: parsed.data.name,
      dsh_description: parsed.data.description ?? null,
      dsh_price: parsed.data.price,
      dsh_is_available: parsed.data.isAvailable,
      ...(imageUrl ? { dsh_image_url: imageUrl } : {}),
    })
    .eq('dsh_id', dishId)
    .eq('dsh_chef_id', chefId) // ownership guard

  if (error) return { error: error.message }

  revalidatePath('/chef/dishes')
  redirect('/chef/dishes')
}

export async function deleteDish(dishId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in' }

  const chefId = await getChefId(supabase, user.id)
  if (!chefId) return { error: 'Chef profile not found' }

  const { error } = await supabase
    .from('tbl_dish')
    .delete()
    .eq('dsh_id', dishId)
    .eq('dsh_chef_id', chefId)

  if (error) return { error: error.message }

  revalidatePath('/chef/dishes')
  return { error: undefined }
}

export async function toggleDishAvailability(dishId: number, isAvailable: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in' }

  const chefId = await getChefId(supabase, user.id)
  if (!chefId) return { error: 'Chef profile not found' }

  const { error } = await supabase
    .from('tbl_dish')
    .update({ dsh_is_available: isAvailable })
    .eq('dsh_id', dishId)
    .eq('dsh_chef_id', chefId)

  if (error) return { error: error.message }

  revalidatePath('/chef/dishes')
  return { error: undefined }
}
