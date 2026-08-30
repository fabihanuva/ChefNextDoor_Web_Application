'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Observer pattern, Supabase-native: subscribes to UPDATE events on the
 * customer's order row and updates local state live.
 *
 * Requires Realtime replication to be enabled on tbl_order in the
 * Supabase dashboard (Database → Replication).
 */
export function useRealtimeOrder(orderId: number, initialStatus: string) {
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tbl_order',
          filter: `ord_id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { ord_status?: string }).ord_status
          if (newStatus) setStatus(newStatus)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  return status
}
