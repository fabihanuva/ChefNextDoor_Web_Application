import Link from 'next/link'
import { Button } from '@/components/shared/Button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-brand-cream px-4">
      <div className="text-center max-w-sm">
        <p className="font-display text-6xl text-brand-green mb-2">404</p>
        <h1 className="font-display text-2xl text-gray-900 mb-2">
          This kitchen doesn&apos;t exist
        </h1>
        <p className="text-gray-500 mb-6">
          The page you&apos;re looking for isn&apos;t on the menu. Let&apos;s get you
          back to something delicious.
        </p>
        <Link href="/">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  )
}
