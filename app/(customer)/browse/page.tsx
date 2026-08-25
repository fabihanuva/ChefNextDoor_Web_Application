import { createClient } from '@/lib/supabase/server'
import { ChefCard } from '@/components/customer/ChefCard'
import { SearchBar } from '@/components/customer/SearchBar'
import type { Chef } from '@/lib/types'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  // Only verified chefs are visible to customers (pending/rejected stay hidden)
  let query = supabase
    .from('tbl_chef_profile')
    .select('*, tbl_users(usr_full_name, usr_profile_image)')
    .eq('chf_verification_status', 'verified')

  if (q) {
    // Note: filtering on cuisine type only for now. Searching the joined
    // chef name too requires a Postgres view or RPC — a good Phase 8+
    // improvement once tbl_review-based ratings are in place too.
    query = query.ilike('chf_cuisine_type', `%${q}%`)
  }

  const { data: chefs, error } = await query.returns<Chef[]>()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-2">Find your next meal</h1>
      <p className="text-gray-500 mb-6">Browse home chefs cooking near you</p>

      <SearchBar defaultValue={q ?? ''} />

      {error && (
        <p className="text-red-600 text-sm mt-4">Couldn&apos;t load chefs right now.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {chefs?.map((chef) => (
          <ChefCard key={chef.chf_id} chef={chef} />
        ))}
        {chefs?.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-12">
            No chefs match your search yet.
          </p>
        )}
      </div>
    </div>
  )
}
