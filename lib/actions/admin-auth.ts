'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { AuthState } from '@/lib/actions/auth'

/**
 * Admin accounts are NOT self-registered and are NOT rows on tbl_users.
 * Seed them manually:
 *   1. Create the user in Supabase Auth (dashboard or `supabase.auth.admin.createUser`)
 *   2. Insert a matching row into tbl_admin with the same email
 * This keeps Admin a fully standalone entity per your ERD, while still
 * reusing Supabase Auth for secure password handling + sessions.
 */

const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export async function adminSignIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = adminLoginSchema.safeParse({
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

  // Confirm this authenticated account is actually registered as an admin
  const { data: admin } = await supabase
    .from('tbl_admin')
    .select('adm_id')
    .eq('adm_email', data.user.email)
    .single()

  if (!admin) {
    await supabase.auth.signOut()
    return { error: 'This account is not authorized as an admin' }
  }

  redirect('/admin/dashboard')
}

export async function adminSignOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
