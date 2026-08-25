'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from './Button'

type Role = 'customer' | 'chef' | undefined

export function NavLinks({
  isLoggedIn,
  role,
  signOutAction,
}: {
  isLoggedIn: boolean
  role: Role
  signOutAction: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)

  const links = !isLoggedIn
    ? [
        { href: '/browse', label: 'Browse' },
        { href: '/login', label: 'Log in' },
      ]
    : role === 'chef'
      ? [
          { href: '/chef/dashboard', label: 'Dashboard' },
          { href: '/chef/dishes', label: 'My dishes' },
          { href: '/chef/orders', label: 'Orders' },
        ]
      : [
          { href: '/browse', label: 'Browse' },
          { href: '/orders', label: 'My orders' },
          { href: '/favorites', label: 'Favorites' },
          { href: '/cart', label: 'Cart' },
        ]

  return (
    <>
      <nav className="hidden md:flex items-center gap-6">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-sm text-gray-700 hover:text-brand-green">
            {l.label}
          </Link>
        ))}
        {isLoggedIn ? (
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        ) : (
          <Link href="/register">
            <Button size="sm">Sign up</Button>
          </Link>
        )}
      </nav>

      <button
        className="md:hidden p-2 text-gray-700"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 md:hidden">
          <div className="flex flex-col p-4 gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-gray-700"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm" className="w-full">
                  Log out
                </Button>
              </form>
            ) : (
              <Link href="/register" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">
                  Sign up
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}
