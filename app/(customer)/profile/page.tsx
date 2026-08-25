import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/customer/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('tbl_users')
    .select('*')
    .eq('usr_id', user.id)
    .single()

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Your profile</h1>
      <ProfileForm
        email={user.email ?? ''}
        fullName={profile?.usr_full_name ?? ''}
        phone={profile?.usr_phone ?? ''}
      />
    </div>
  )
}
