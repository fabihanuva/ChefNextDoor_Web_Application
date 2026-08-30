import { createClient } from '@/lib/supabase/server'

/**
 * Verifies the current session belongs to a real tbl_admin row.
 * Call this at the top of every admin Server Action as a second line of
 * defense alongside the middleware.ts route guard (Phase 5) — the same
 * ownership-check pattern used for chef actions in Phase 8.
 *
 * Returns the tbl_admin row (not the auth user) so actions that need to
 * stamp adm_id (e.g. sc_admin_id on support content) have it on hand.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: admin } = await supabase
    .from('tbl_admin')
    .select('adm_id, adm_email, adm_access_level')
    .eq('adm_email', user.email)
    .single()

  return admin
}
