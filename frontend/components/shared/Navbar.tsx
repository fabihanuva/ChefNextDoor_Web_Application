import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { NavLinks } from './NavLinks'

/**
 * Server Component: reads the Supabase session server-side so the
 * correct nav links render on first paint (no client-side flicker).
 * Interactivity (mobile menu toggle, logout button) lives in NavLinks.
 */
export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user?.user_metadata?.role as 'customer' | 'chef' | undefined

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between relative">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpeg" alt="ChefNextDoor" width={36} height={36} className="rounded-full" />
          <span className="font-display text-xl text-brand-green">ChefNextDoor</span>
        </Link>

        <NavLinks isLoggedIn={!!user} role={role} signOutAction={signOut} />
      </div>
    </header>
  )
}
