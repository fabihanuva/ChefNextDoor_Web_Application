import { createSupabaseMock, ok, fail, mockUser } from '../../helpers/supabaseMock'

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { placeOrder } from '@/lib/actions/order'

const mockedCreateClient = createClient as jest.Mock

const cartItems = [{ dishId: 1, chefId: 5, name: 'Biryani', price: 300, quantity: 2 }]

function buildForm(overrides: Partial<Record<string, string>> = {}) {
  const form = new FormData()
  form.set('cartPayload', JSON.stringify(cartItems))
  form.set('deliveryAddress', overrides.deliveryAddress ?? '123 Gulshan Ave, Dhaka')
  form.set('paymentMethodId', overrides.paymentMethodId ?? '1')
  return form
}

describe('placeOrder', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects when cart payload is missing', async () => {
    const form = new FormData()
    form.set('deliveryAddress', '123 Gulshan Ave, Dhaka')
    form.set('paymentMethodId', '1')

    const result = await placeOrder(undefined, form)

    expect(result?.error).toBe('Missing cart data')
  })

  it('rejects when cart payload is not valid JSON', async () => {
    const form = new FormData()
    form.set('cartPayload', '{not json')
    form.set('deliveryAddress', '123 Gulshan Ave, Dhaka')
    form.set('paymentMethodId', '1')

    const result = await placeOrder(undefined, form)

    expect(result?.error).toBe('Could not read cart data')
  })

  it('rejects a too-short delivery address', async () => {
    const result = await placeOrder(undefined, buildForm({ deliveryAddress: 'Rd' }))

    expect(result?.error).toMatch(/delivery address/i)
  })

  it('rejects a missing payment method', async () => {
    const result = await placeOrder(undefined, buildForm({ paymentMethodId: '0' }))

    expect(result?.error).toMatch(/payment method/i)
  })

  it('requires the customer to be logged in', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: null } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await placeOrder(undefined, buildForm())

    expect(result?.error).toBe('You must be logged in to place an order')
  })

  it('requires a resolved customer profile', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: { tbl_customer: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await placeOrder(undefined, buildForm())

    expect(result?.error).toBe('Customer profile not found')
  })

  it('creates the order and its line items, then redirects to tracking', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_customer: ok({ cs_id: 9 }),
        tbl_order: ok({ ord_id: 555 }),
        tbl_order_items: ok(null),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    await expect(placeOrder(undefined, buildForm())).rejects.toThrow(
      'NEXT_REDIRECT:/orders/555/track'
    )
    expect(redirect).toHaveBeenCalledWith('/orders/555/track')
  })

  it('returns an error and does not redirect if order creation fails', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_customer: ok({ cs_id: 9 }),
        tbl_order: fail('insert failed'),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await placeOrder(undefined, buildForm())

    expect(result?.error).toBe('insert failed')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns an error if inserting order items fails', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_customer: ok({ cs_id: 9 }),
        tbl_order: ok({ ord_id: 555 }),
        tbl_order_items: fail('items insert failed'),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await placeOrder(undefined, buildForm())

    expect(result?.error).toBe('items insert failed')
  })
})
