'use client'

import { useActionState } from 'react'
import { Button } from '@/components/shared/Button'
import {
  createDeliveryPartner,
  type DeliveryPartnerState,
} from '@/lib/actions/adminDeliveryPartners'

export default function NewDeliveryPartnerPage() {
  const [state, formAction, isPending] = useActionState<DeliveryPartnerState, FormData>(
    createDeliveryPartner,
    undefined
  )

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl text-gray-900 mb-6">Add delivery partner</h1>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <input
            name="phone"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Vehicle type</label>
          <input
            name="vehicleType"
            placeholder="Bike, car, scooter..."
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Adding...' : 'Add partner'}
        </Button>
      </form>
    </div>
  )
}
