import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/customer/ProfileForm'
import { OrderStatusBadge } from '@/components/shared/Badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { getCustomerId } from '@/lib/actions/customer-helpers'
import { formatCurrency } from '@/lib/utils'

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

  const customerId = await getCustomerId(supabase, user.id)

  const [{ count: orderCount }, { count: favoriteCount }, { data: recentOrders }, { data: customerRow }] =
    await Promise.all([
      customerId
        ? supabase
            .from('tbl_order')
            .select('*', { count: 'exact', head: true })
            .eq('ord_customer_id', customerId)
        : Promise.resolve({ count: 0 }),
      customerId
        ? supabase
            .from('tbl_favorites')
            .select('*', { count: 'exact', head: true })
            .eq('fav_customer_id', customerId)
        : Promise.resolve({ count: 0 }),
      customerId
        ? supabase
            .from('tbl_order')
            .select('ord_id, ord_status, ord_total_amount, ord_order_date')
            .eq('ord_customer_id', customerId)
            .order('ord_order_date', { ascending: false })
            .limit(5)
        : Promise.resolve({ data: [] }),
      customerId
        ? supabase.from('tbl_customer').select('cs_default_address').eq('cs_id', customerId).single()
        : Promise.resolve({ data: null }),
    ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-gray-900 mb-6">Your profile</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href="/orders"
          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition"
        >
          <p className="text-sm text-gray-500">Total orders</p>
          <p className="font-display text-2xl text-gray-900 mt-1">{orderCount ?? 0}</p>
        </Link>
        <Link
          href="/favorites"
          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition"
        >
          <p className="text-sm text-gray-500">Favorite dishes</p>
          <p className="font-display text-2xl text-gray-900 mt-1">{favoriteCount ?? 0}</p>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-gray-900">Recent orders</h2>
          {recentOrders && recentOrders.length > 0 && (
            <Link href="/orders" className="text-sm text-brand-green hover:underline">
              View all
            </Link>
          )}
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.ord_id}
                href={`/orders/${order.ord_id}/track`}
                className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition"
              >
                <div>
                  <p className="font-mono text-sm text-gray-900">#{order.ord_id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.ord_order_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-brand-green">
                    {formatCurrency(Number(order.ord_total_amount))}
                  </p>
                  <div className="mt-1">
                    <OrderStatusBadge status={order.ord_status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🧾"
            title="No orders yet"
            message="Once you place an order, it'll show up here."
            actionLabel="Browse chefs"
            actionHref="/browse"
          />
        )}
      </div>

      <div>
        <h2 className="font-display text-xl text-gray-900 mb-3">Account details</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <ProfileForm
            email={user.email ?? ''}
            fullName={profile?.usr_full_name ?? ''}
            phone={profile?.usr_phone ?? ''}
            defaultAddress={customerRow?.cs_default_address ?? ''}
            avatarUrl={profile?.usr_profile_image ?? null}
          />
        </div>
      </div>
    </div>
  )
}
