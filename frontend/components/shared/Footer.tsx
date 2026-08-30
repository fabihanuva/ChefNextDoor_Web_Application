import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-24">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p className="font-display text-xl text-brand-green">ChefNextDoor</p>
          <p className="text-sm text-gray-500 mt-2">
            Home-cooked meals from local chefs, delivered to your door.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Explore</p>
          <ul className="space-y-1 text-sm text-gray-500">
            <li>
              <Link href="/browse" className="hover:text-brand-green">
                Browse chefs
              </Link>
            </li>
            <li>
              <Link href="/register/chef" className="hover:text-brand-green">
                Become a chef
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Support</p>
          <ul className="space-y-1 text-sm text-gray-500">
            <li>
              <Link href="/support" className="hover:text-brand-green">
                Help center
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-brand-green">
                About us
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} ChefNextDoor. All rights reserved.
      </div>
    </footer>
  )
}
