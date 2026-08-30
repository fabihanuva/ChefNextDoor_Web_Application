import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({
  rating,
  outOf = 5,
  size = 16,
  showValue = true,
  className,
}: {
  rating: number
  outOf?: number
  size?: number
  showValue?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: outOf }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.round(rating)
              ? 'fill-brand-gold text-brand-gold'
              : 'fill-gray-200 text-gray-200'
          }
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-gray-600 font-mono">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
