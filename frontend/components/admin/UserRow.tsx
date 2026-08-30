'use client'

import { useTransition } from 'react'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { suspendUser, reactivateUser } from '@/lib/actions/adminUsers'

export function UserRow({
  user,
}: {
  user: { usr_id: string; usr_full_name: string; usr_email: string; usr_is_active: boolean }
}) {
  const [isPending, startTransition] = useTransition()
  const isSuspended = !user.usr_is_active

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
      <div>
        <p className="font-medium text-gray-900">{user.usr_full_name}</p>
        <p className="text-sm text-gray-500">{user.usr_email}</p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={isSuspended ? 'danger' : 'success'}>
          {isSuspended ? 'Suspended' : 'Active'}
        </Badge>
        <Button
          size="sm"
          variant={isSuspended ? 'primary' : 'danger'}
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              isSuspended ? reactivateUser(user.usr_id) : suspendUser(user.usr_id)
            )
          }
        >
          {isSuspended ? 'Reactivate' : 'Suspend'}
        </Button>
      </div>
    </div>
  )
}
