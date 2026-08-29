import Link from 'next/link'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/shared/Button'
import { OrderStatusBadge } from '@/components/shared/Badge'
import { formatCurrency } from '@/lib/utils'

function timeOfDayGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

type CustomerData = {
  role: 'customer'
  name: string
  activeOrder: { ord_id: number; ord_status: string; ord_total_amount: number | string } | null
}

type ChefData = {
  role: 'chef'
  name: string
  pendingOrderCount: number
  isVerified: boolean
}

export function PersonalizedHome({ data }: { data: CustomerData | ChefData }) {
  const firstName = data.name.split(' ')[0]

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh]">
        <section className="max-w-4xl mx-auto px-4 pt-16 pb-12">
          <p className="font-mono text-xs tracking-widest text-brand-green uppercase mb-3">
            {timeOfDayGreeting()}
          </p>
          <h1 className="font-display text-4xl text-gray-900">Welcome back, {firstName}.</h1>

          {data.role === 'customer' ? (
            <>
              <p className="text-gray-600 mt-3 max-w-md">
                {data.activeOrder
                  ? "You've got an order on the way — here's where things stand."
                  : 'Hungry? Find something home-cooked nearby.'}
              </p>

              {data.activeOrder && (
                <Link
                  href={`/orders/${data.activeOrder.ord_id}/track`}
                  className="mt-6 flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition max-w-md"
                >
                  <div>
                    <p className="font-mono text-sm text-gray-500">
                      Order #{data.activeOrder.ord_id}
                    </p>
                    <p className="font-mono text-brand-green mt-1">
                      {formatCurrency(Number(data.activeOrder.ord_total_amount))}
                    </p>
                  </div>
                  <OrderStatusBadge status={data.activeOrder.ord_status} />
                </Link>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl">
                {[
                  { href: '/browse', label: 'Browse chefs' },
                  { href: '/orders', label: 'My orders' },
                  { href: '/favorites', label: 'Favorites' },
                  { href: '/cart', label: 'Cart' },
                ].map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="bg-white rounded-xl border border-gray-100 p-4 text-center text-sm font-medium text-gray-700 hover:shadow-md hover:text-brand-green transition"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mt-3 max-w-md">
                {data.isVerified
                  ? data.pendingOrderCount > 0
                    ? `You have ${data.pendingOrderCount} order${data.pendingOrderCount === 1 ? '' : 's'} waiting on you.`
                    : 'All caught up — no orders waiting right now.'
                  : 'Your account is still pending admin approval.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl">
                {[
                  { href: '/chef/dashboard', label: 'Dashboard' },
                  { href: '/chef/dishes', label: 'My dishes' },
                  { href: '/chef/orders', label: 'Orders' },
                  { href: '/chef/earnings', label: 'Earnings' },
                ].map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="bg-white rounded-xl border border-gray-100 p-4 text-center text-sm font-medium text-gray-700 hover:shadow-md hover:text-brand-green transition"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>

              <div className="mt-6">
                <Link href="/chef/dishes/new">
                  <Button>Add a new dish</Button>
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
