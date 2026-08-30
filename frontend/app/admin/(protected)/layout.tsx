import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  ChefHat,
  ClipboardList,
  Truck,
  FileText,
  DollarSign,
  LogOut,
} from 'lucide-react'
import { adminSignOut } from '@/lib/actions/admin-auth'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Customers', icon: Users },
  { href: '/admin/chefs', label: 'Chefs', icon: ChefHat },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/delivery-partners', label: 'Delivery partners', icon: Truck },
  { href: '/admin/support-content', label: 'Support content', icon: FileText },
  { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
]

/**
 * This layout lives at app/admin/(protected)/layout.tsx — the route group
 * means it applies to every admin page EXCEPT app/admin/login/page.tsx
 * (from Phase 5), which stays outside the group and renders without a
 * sidebar. Route groups don't affect the URL, so /admin/dashboard still
 * resolves correctly.
 */
export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <p className="font-display text-lg">ChefNextDoor</p>
          <p className="text-xs text-gray-400">Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <form action={adminSignOut} className="p-3 border-t border-gray-800">
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition w-full"
          >
            <LogOut size={16} />
            Log out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
