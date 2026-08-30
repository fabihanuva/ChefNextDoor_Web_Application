import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function CustomerLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LoadingSpinner size={32} />
    </div>
  )
}
