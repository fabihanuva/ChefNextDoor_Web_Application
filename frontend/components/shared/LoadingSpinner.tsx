import { cn } from '@/lib/utils'

export function LoadingSpinner({
  className,
  size = 24,
}: {
  className?: string
  size?: number
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
      className={cn(
        'animate-spin rounded-full border-2 border-brand-green/20 border-t-brand-green',
        className
      )}
    />
  )
}
