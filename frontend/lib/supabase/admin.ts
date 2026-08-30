import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Service-role client — bypasses Row Level Security entirely.
 *
 * The 'server-only' import causes a build error if this file is ever
 * pulled into client-bundled code, as a hard guard on top of never
 * putting SUPABASE_SECRET_KEY in a NEXT_PUBLIC_ variable.
 *
 * Only call this from Server Actions / Route Handlers under app/admin,
 * and only after requireAdmin() has verified the caller. This lets
 * Admin read/write every table without admin-specific RLS policies
 * bolted onto all 12 tables.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
