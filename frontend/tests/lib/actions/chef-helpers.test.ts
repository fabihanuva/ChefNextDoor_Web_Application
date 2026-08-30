import { getChefId, getChefOrderIds } from '@/lib/actions/chef-helpers'
import { createSupabaseMock, ok } from '../../helpers/supabaseMock'

describe('getChefId', () => {
  it('resolves the auth user id to a chf_id', async () => {
    const supabase = createSupabaseMock({
      from: { tbl_chef_profile: ok({ chf_id: 42 }) },
    })

    const result = await getChefId(supabase as any, 'auth-user-1')

    expect(result).toBe(42)
    expect(supabase.from).toHaveBeenCalledWith('tbl_chef_profile')
  })

  it('returns null when no chef profile matches', async () => {
    const supabase = createSupabaseMock({
      from: { tbl_chef_profile: ok(null) },
    })

    const result = await getChefId(supabase as any, 'auth-user-unknown')

    expect(result).toBeNull()
  })
})

describe('getChefOrderIds', () => {
  it('returns an empty array when the chef has no dishes', async () => {
    const supabase = createSupabaseMock({
      from: { tbl_dish: ok([]) },
    })

    const result = await getChefOrderIds(supabase as any, 1)

    expect(result).toEqual([])
  })

  it('resolves dish ids to their distinct order ids', async () => {
    const supabase = createSupabaseMock({
      from: {
        tbl_dish: ok([{ dsh_id: 1 }, { dsh_id: 2 }]),
        tbl_order_items: ok([
          { oi_order_id: 100 },
          { oi_order_id: 101 },
          { oi_order_id: 100 }, // duplicate order id should be de-duped
        ]),
      },
    })

    const result = await getChefOrderIds(supabase as any, 1)

    expect(result).toEqual([100, 101])
  })

  it('returns an empty array when dishes exist but have no order items', async () => {
    const supabase = createSupabaseMock({
      from: {
        tbl_dish: ok([{ dsh_id: 1 }]),
        tbl_order_items: ok(null),
      },
    })

    const result = await getChefOrderIds(supabase as any, 1)

    expect(result).toEqual([])
  })
})
