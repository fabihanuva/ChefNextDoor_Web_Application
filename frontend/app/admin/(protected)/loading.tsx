import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function AdminLoading() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <LoadingSpinner size={28} />
    </div>
  )
}
