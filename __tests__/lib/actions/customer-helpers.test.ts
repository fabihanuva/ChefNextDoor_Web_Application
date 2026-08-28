import { getCustomerId } from '@/lib/actions/customer-helpers'
import { createSupabaseMock, ok } from '../../helpers/supabaseMock'

describe('getCustomerId', () => {
  it('resolves the auth user id to a cs_id', async () => {
    const supabase = createSupabaseMock({
      from: { tbl_customer: ok({ cs_id: 7 }) },
    })

    const result = await getCustomerId(supabase as any, 'auth-user-1')

    expect(result).toBe(7)
    expect(supabase.from).toHaveBeenCalledWith('tbl_customer')
  })

  it('returns null when no customer profile matches', async () => {
    const supabase = createSupabaseMock({
      from: { tbl_customer: ok(null) },
    })

    const result = await getCustomerId(supabase as any, 'auth-user-unknown')

    expect(result).toBeNull()
  })
})
