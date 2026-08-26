import { createAdminClient } from '@/lib/supabase/admin'
import { ChefRow } from '@/components/admin/ChefRow'

export default async function AdminChefsPage() {
  const supabase = createAdminClient()
  const { data: chefs } = await supabase
    .from('tbl_chef_profile')
    .select('*, tbl_users(usr_full_name)')
    .order('chf_verification_status')

  return (
    <div>
      <h1 className="font-display text-2xl text-gray-900 mb-6">Chefs</h1>
      <div className="space-y-3">
        {chefs?.map((chef) => (
          <ChefRow key={chef.chf_id} chef={chef} />
        ))}
        {chefs?.length === 0 && <p className="text-gray-500">No chefs yet.</p>}
      </div>
    </div>
  )
}
