import { createSupabaseMock, ok, fail, mockUser } from '../../helpers/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }))

import { createClient } from '@/lib/supabase/server'
import { updateOrderStatus } from '@/lib/actions/chefOrder'

const mockedCreateClient = createClient as jest.Mock

describe('updateOrderStatus', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects an invalid status without ever calling Supabase', async () => {
    const supabase = createSupabaseMock()
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateOrderStatus(1, 'not-a-real-status')

    expect(result.error).toBe('Invalid status')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('requires an authenticated user', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: null } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateOrderStatus(1, 'confirmed')

    expect(result.error).toBe('You must be logged in')
  })

  it('requires a resolved chef profile', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: { tbl_chef_profile: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateOrderStatus(1, 'confirmed')

    expect(result.error).toBe('Chef profile not found')
  })

  it('rejects updating an order that does not belong to this chef', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_chef_profile: ok({ chf_id: 5 }),
        tbl_dish: ok([{ dsh_id: 1 }]),
        tbl_order_items: ok([{ oi_order_id: 999 }]), // order 1 is not in this list
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateOrderStatus(1, 'confirmed')

    expect(result.error).toBe('This order does not belong to you')
  })

  it('updates status for an order the chef owns', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_chef_profile: ok({ chf_id: 5 }),
        tbl_dish: ok([{ dsh_id: 1 }]),
        tbl_order_items: ok([{ oi_order_id: 1 }]),
        tbl_order: ok(null),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateOrderStatus(1, 'confirmed')

    expect(result.error).toBeUndefined()
    expect(supabase.from).toHaveBeenCalledWith('tbl_order')
  })

  it('surfaces a database error on failed update', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_chef_profile: ok({ chf_id: 5 }),
        tbl_dish: ok([{ dsh_id: 1 }]),
        tbl_order_items: ok([{ oi_order_id: 1 }]),
        tbl_order: fail('update failed'),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateOrderStatus(1, 'confirmed')

    expect(result.error).toBe('update failed')
  })
})
