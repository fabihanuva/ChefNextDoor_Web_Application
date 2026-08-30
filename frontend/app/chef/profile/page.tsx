import { createClient } from '@/lib/supabase/server'
import { ChefProfileForm } from '@/components/chef/ChefProfileForm'

export default async function ChefProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('tbl_chef_profile')
    .select('*, tbl_users(usr_full_name, usr_profile_image)')
    .eq('chf_user_id', user.id)
    .single()

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Your chef profile</h1>
      <ChefProfileForm
        fullName={profile?.tbl_users?.usr_full_name ?? ''}
        cuisineType={profile?.chf_cuisine_type ?? ''}
        kitchenAddress={profile?.chf_kitchen_address ?? ''}
        bio={profile?.chf_bio ?? ''}
        avatarUrl={profile?.tbl_users?.usr_profile_image ?? null}
      />
    </div>
  )
}
