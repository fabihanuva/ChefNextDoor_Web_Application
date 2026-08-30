import { createSupabaseMock, ok, fail, mockUser } from '../../helpers/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }))

import { createClient } from '@/lib/supabase/server'
import { createReview, getOrderReview } from '@/lib/actions/review'

const mockedCreateClient = createClient as jest.Mock

function buildForm(fields: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

const validReviewFields = { orderId: '1', rating: '5', comment: 'Delicious!' }

describe('createReview', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects a rating outside 1-5', async () => {
    const result = await createReview(undefined, buildForm({ orderId: '1', rating: '9' }))
    expect(result?.error).toBeDefined()
  })

  it('requires an authenticated user', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: null } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createReview(undefined, buildForm(validReviewFields))

    expect(result?.error).toBe('You must be logged in')
  })

  it('requires a resolved customer profile', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: { tbl_customer: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createReview(undefined, buildForm(validReviewFields))

    expect(result?.error).toBe('Customer profile not found')
  })

  it('rejects reviewing an order that does not belong to the customer', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_customer: ok({ cs_id: 3 }),
        tbl_order: ok({ ord_id: 1, ord_status: 'delivered', ord_customer_id: 999 }),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createReview(undefined, buildForm(validReviewFields))

    expect(result?.error).toBe('Order not found')
  })

  it('rejects reviewing an order that has not been delivered yet', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_customer: ok({ cs_id: 3 }),
        tbl_order: ok({ ord_id: 1, ord_status: 'preparing', ord_customer_id: 3 }),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createReview(undefined, buildForm(validReviewFields))

    expect(result?.error).toBe('You can only review delivered orders')
  })

  it('surfaces a duplicate-review database error', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_customer: ok({ cs_id: 3 }),
        tbl_order: ok({ ord_id: 1, ord_status: 'delivered', ord_customer_id: 3 }),
        tbl_review: fail('duplicate key value violates unique constraint "uq_rv_order_id"'),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createReview(undefined, buildForm(validReviewFields))

    expect(result?.error).toMatch(/uq_rv_order_id/)
  })

  it('inserts the review and recomputes the chef rating on success', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_customer: ok({ cs_id: 3 }),
        tbl_order: ok({ ord_id: 1, ord_status: 'delivered', ord_customer_id: 3 }),
        tbl_review: [
          ok(null), // insert succeeds
          ok([{ rv_rating: 5 }, { rv_rating: 3 }]), // recompute: fetch this chef's reviews
        ],
        // getOrderChefId hop
        tbl_order_items: [
          ok({ tbl_dish: { dsh_chef_id: 5 } }), // getOrderChefId
          ok([{ oi_order_id: 1 }]), // getChefOrderIds -> order items for this chef's dishes
        ],
        tbl_dish: ok([{ dsh_id: 1 }]), // getChefOrderIds -> chef's dish ids
        tbl_chef_profile: ok(null), // rating update
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createReview(undefined, buildForm(validReviewFields))

    expect(result).toEqual({ success: true })
    expect(supabase.from).toHaveBeenCalledWith('tbl_chef_profile')
  })

  it('still succeeds even if the chef cannot be resolved for rating recompute', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_customer: ok({ cs_id: 3 }),
        tbl_order: ok({ ord_id: 1, ord_status: 'delivered', ord_customer_id: 3 }),
        tbl_review: ok(null),
        tbl_order_items: ok(null), // getOrderChefId finds nothing
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createReview(undefined, buildForm(validReviewFields))

    expect(result).toEqual({ success: true })
  })
})

describe('getOrderReview', () => {
  afterEach(() => jest.clearAllMocks())

  it('returns the review for an order when one exists', async () => {
    const supabase = createSupabaseMock({
      from: { tbl_review: ok({ rv_rating: 4, rv_comment: 'Good' }) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await getOrderReview(1)

    expect(result).toEqual({ rv_rating: 4, rv_comment: 'Good' })
  })

  it('returns null when the order has not been reviewed', async () => {
    const supabase = createSupabaseMock({
      from: { tbl_review: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await getOrderReview(1)

    expect(result).toBeNull()
  })
})
