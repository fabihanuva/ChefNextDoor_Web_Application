'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteSupportContent } from '@/lib/actions/adminSupportContent'

export function SupportContentRow({
  content,
}: {
  content: { sc_id: number; sc_title: string; sc_content: string }
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-start justify-between bg-white rounded-xl border border-gray-100 p-4">
      <div>
        <p className="font-medium text-gray-900">{content.sc_title}</p>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{content.sc_content}</p>
      </div>
      <button
        onClick={() => {
          if (confirm(`Delete "${content.sc_title}"?`)) {
            startTransition(() => deleteSupportContent(content.sc_id))
          }
        }}
        disabled={isPending}
        className="text-gray-400 hover:text-red-600 shrink-0 ml-4"
        aria-label="Delete article"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}
