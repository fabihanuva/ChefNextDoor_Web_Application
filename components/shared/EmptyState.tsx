import Link from 'next/link'
import { Button } from './Button'

export function EmptyState({
  emoji = '🍽',
  title,
  message,
  actionLabel,
  actionHref,
}: {
  emoji?: string
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-4xl mb-4">{emoji}</div>
      <p className="font-display text-lg text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="inline-block mt-5">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  )
}
