import { createAdminClient } from '@/lib/supabase/admin'
import { formatCurrency } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  const [
    { count: customerCount },
    { count: chefCount },
    { count: pendingChefCount },
    { count: orderCount },
    { data: deliveredOrders },
  ] = await Promise.all([
    supabase.from('tbl_customer').select('*', { count: 'exact', head: true }),
    supabase.from('tbl_chef_profile').select('*', { count: 'exact', head: true }),
    supabase
      .from('tbl_chef_profile')
      .select('*', { count: 'exact', head: true })
      .eq('chf_verification_status', 'pending'),
    supabase.from('tbl_order').select('*', { count: 'exact', head: true }),
    supabase.from('tbl_order').select('ord_total_amount').eq('ord_status', 'delivered'),
  ])

  const totalRevenue =
    deliveredOrders?.reduce((sum, o) => sum + Number(o.ord_total_amount ?? 0), 0) ?? 0

  const stats = [
    { label: 'Customers', value: customerCount ?? 0 },
    { label: 'Chefs', value: chefCount ?? 0 },
    { label: 'Pending approvals', value: pendingChefCount ?? 0 },
    { label: 'Total orders', value: orderCount ?? 0 },
    { label: 'Platform revenue', value: formatCurrency(totalRevenue) },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl text-gray-900 mb-6">Platform overview</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="font-display text-xl text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
