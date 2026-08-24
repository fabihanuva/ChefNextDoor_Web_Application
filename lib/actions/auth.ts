'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string } | undefined

// ---------- Customer sign up ----------
const customerSignUpSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(6, 'Enter a valid phone number'),
})

export async function signUpCustomer(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = customerSignUpSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { fullName, email, password, phone } = parsed.data
  const supabase = await createClient()

  // 1. Create the Supabase Auth user, tagging role in metadata.
  //    Your DB trigger (handle_new_user) auto-inserts a matching
  //    tbl_users row the instant this succeeds — no manual insert here.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: 'customer', full_name: fullName } },
  })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Could not create account' }
  }

  // 2. Fill in the phone number the trigger doesn't set
  const { error: updateError } = await supabase
    .from('tbl_users')
    .update({ usr_phone: phone })
    .eq('usr_id', authData.user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  // 3. Insert the customer-specific row
  const { error: customerError } = await supabase.from('tbl_customer').insert({
    cs_user_id: authData.user.id,
  })

  if (customerError) {
    return { error: customerError.message }
  }

  redirect('/login?registered=true')
}

// ---------- Chef sign up ----------
const chefSignUpSchema = customerSignUpSchema.extend({
  cuisineType: z.string().min(2, 'Tell us what you cook'),
  kitchenAddress: z.string().min(5, 'Enter your kitchen address'),
})

export async function signUpChef(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = chefSignUpSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    phone: formData.get('phone'),
    cuisineType: formData.get('cuisineType'),
    kitchenAddress: formData.get('kitchenAddress'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { fullName, email, password, phone, cuisineType, kitchenAddress } = parsed.data
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: 'chef', full_name: fullName } },
  })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Could not create account' }
  }

  const { error: updateError } = await supabase
    .from('tbl_users')
    .update({ usr_phone: phone })
    .eq('usr_id', authData.user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  // Chefs start as 'pending' until Admin approves them (Phase 10)
  const { error: chefError } = await supabase.from('tbl_chef_profile').insert({
    chf_user_id: authData.user.id,
    chf_cuisine_type: cuisineType,
    chf_kitchen_address: kitchenAddress,
    chf_verification_status: 'pending',
  })

  if (chefError) {
    return { error: chefError.message }
  }

  redirect('/login?registered=true&pending=true')
}

// ---------- Login (customer or chef) ----------
const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Enter a valid email and password' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error || !data.user) {
    return { error: 'Invalid email or password' }
  }

  const role = data.user.user_metadata?.role

  revalidatePath('/', 'layout')

  if (role === 'chef') {
    redirect('/chef/dashboard')
  }
  redirect('/browse')
}

// ---------- Logout ----------
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
