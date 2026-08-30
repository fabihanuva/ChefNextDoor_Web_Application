import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral'

const styles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-700',
}

export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

/**
 * Convenience mapper for your tbl_order status values →
 * adjust the keys to match your actual order status enum.
 */
export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    pending: 'warning',
    confirmed: 'neutral',
    preparing: 'warning',
    out_for_delivery: 'neutral',
    delivered: 'success',
    cancelled: 'danger',
  }
  return <Badge variant={map[status] ?? 'neutral'}>{status.replace(/_/g, ' ')}</Badge>
}
