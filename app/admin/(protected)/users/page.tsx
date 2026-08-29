import { createAdminClient } from '@/lib/supabase/admin'
import { UserRow } from '@/components/admin/UserRow'
import { EmptyState } from '@/components/shared/EmptyState'

type CustomerRow = {
  cs_id: number
  tbl_users: {
    usr_id: string
    usr_full_name: string
    usr_email: string
    usr_is_active: boolean
  } | null
}

export default async function AdminUsersPage() {
  const supabase = createAdminClient()

  const { data: customers } = await supabase
    .from('tbl_customer')
    .select('cs_id, tbl_users(usr_id, usr_full_name, usr_email, usr_is_active)')
    .returns<CustomerRow[]>()

  const users = (customers ?? [])
    .filter((c) => c.tbl_users)
    .map((c) => c.tbl_users!)
    .sort((a, b) => a.usr_full_name.localeCompare(b.usr_full_name))

  return (
    <div>
      <h1 className="font-display text-2xl text-gray-900 mb-6">Customers</h1>
      <div className="space-y-3">
        {users.map((u) => (
          <UserRow key={u.usr_id} user={u} />
        ))}
        {users.length === 0 && (
          <EmptyState emoji="🧍" title="No customers yet" message="Customer signups will appear here." />
        )}
      </div>
    </div>
  )
}
