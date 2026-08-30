import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/shared/Button'
import { ChefDishCard } from '@/components/chef/ChefDishCard'
import { formatCurrency } from '@/lib/utils'
import { getChefId, getChefOrderIds } from '@/lib/actions/chef-helpers'
import { calculateChefEarnings } from '@/lib/platformFee'
import type { Dish } from '@/lib/types'

export default async function ChefDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('tbl_chef_profile')
    .select('*, tbl_users(usr_full_name)')
    .eq('chf_user_id', user.id)
    .single()

  const chefId = profile?.chf_id ?? null
  const orderIds = chefId ? await getChefOrderIds(supabase, chefId) : []

  const [{ count: dishCount }, { count: activeOrderCount }, { data: deliveredOrders }, { data: dishes }] =
    await Promise.all([
      chefId
        ? supabase.from('tbl_dish').select('*', { count: 'exact', head: true }).eq('dsh_chef_id', chefId)
        : Promise.resolve({ count: 0 }),
      orderIds.length
        ? supabase
            .from('tbl_order')
            .select('*', { count: 'exact', head: true })
            .in('ord_id', orderIds)
            .not('ord_status', 'in', '("delivered","cancelled")')
        : Promise.resolve({ count: 0 }),
      orderIds.length
        ? supabase
            .from('tbl_order')
            .select('ord_total_amount')
            .in('ord_id', orderIds)
            .eq('ord_status', 'delivered')
        : Promise.resolve({ data: [] }),
      chefId
        ? supabase
            .from('tbl_dish')
            .select('*')
            .eq('dsh_chef_id', chefId)
            .order('dsh_name')
            .returns<Dish[]>()
        : Promise.resolve({ data: [] as Dish[] }),
    ])

  const grossTotal =
    deliveredOrders?.reduce((sum, o) => sum + Number(o.ord_total_amount ?? 0), 0) ?? 0
  const netEarnings = calculateChefEarnings(grossTotal)

  const stats = [
    { label: 'Dishes listed', value: dishCount ?? 0 },
    { label: 'Active orders', value: activeOrderCount ?? 0 },
    { label: 'Your earnings', value: formatCurrency(netEarnings) },
    {
      label: 'Rating',
      value: profile?.chf_rating_avg ? Number(profile.chf_rating_avg).toFixed(1) : '—',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-2">
        Welcome back, {profile?.tbl_users?.usr_full_name ?? 'Chef'}
      </h1>

      {profile?.chf_verification_status === 'pending' && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 my-4">
          Your account is pending admin approval. Your dishes won&apos;t appear to customers
          until then.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="font-display text-2xl text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/chef/dishes/new">
          <Button>Add a dish</Button>
        </Link>
        <Link href="/chef/orders">
          <Button variant="ghost">View orders</Button>
        </Link>
        <Link href="/chef/profile">
          <Button variant="ghost">Edit profile</Button>
        </Link>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-gray-900">Your dishes</h2>
          <Link href="/chef/dishes" className="text-sm text-brand-green hover:underline">
            Manage all
          </Link>
        </div>

        {dishes && dishes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {dishes.map((dish) => (
              <ChefDishCard key={dish.dsh_id} dish={dish} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-gray-500 mb-4">You haven&apos;t added any dishes yet.</p>
            <Link href="/chef/dishes/new">
              <Button>Add your first dish</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
