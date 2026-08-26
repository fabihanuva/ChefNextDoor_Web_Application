'use client'

import { useTransition } from 'react'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { approveChef, rejectChef, suspendChef } from '@/lib/actions/adminChefs'

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  verified: 'success',
  pending: 'warning',
  rejected: 'danger',
  suspended: 'danger',
}

type ChefRowData = {
  chf_id: number
  chf_cuisine_type: string | null
  chf_verification_status: string
  tbl_users: { usr_full_name: string } | null
}

export function ChefRow({ chef }: { chef: ChefRowData }) {
  const [isPending, startTransition] = useTransition()
  const name = chef.tbl_users?.usr_full_name ?? 'Chef'

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{chef.chf_cuisine_type}</p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={STATUS_VARIANT[chef.chf_verification_status] ?? 'neutral'}>
          {chef.chf_verification_status}
        </Badge>

        {chef.chf_verification_status === 'pending' && (
          <>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => startTransition(() => approveChef(chef.chf_id))}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={isPending}
              onClick={() => startTransition(() => rejectChef(chef.chf_id))}
            >
              Reject
            </Button>
          </>
        )}

        {chef.chf_verification_status === 'verified' && (
          <Button
            size="sm"
            variant="danger"
            disabled={isPending}
            onClick={() => startTransition(() => suspendChef(chef.chf_id))}
          >
            Suspend
          </Button>
        )}
      </div>
    </div>
  )
}
