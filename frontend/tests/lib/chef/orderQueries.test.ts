import { createSupabaseMock, ok, fail } from '../../helpers/supabaseMock'
import { getChefOrders } from '@/lib/chef/orderQueries'

describe('getChefOrders', () => {
  it('returns an empty array when the chef has no dishes', async () => {
    const supabase = createSupabaseMock({ from: { tbl_dish: ok([]) } })

    const result = await getChefOrders(supabase, 5)

    expect(result).toEqual([])
  })

  it('returns an empty array when the dish lookup errors', async () => {
    const supabase = createSupabaseMock({ from: { tbl_dish: fail('boom') } })

    const result = await getChefOrders(supabase, 5)

    expect(result).toEqual([])
  })

  it('returns an empty array when there are no order items for the dishes', async () => {
    const supabase = createSupabaseMock({
      from: {
        tbl_dish: ok([{ dsh_id: 1 }]),
        tbl_order_items: ok([]),
      },
    })

    const result = await getChefOrders(supabase, 5)

    expect(result).toEqual([])
  })

  it('returns an empty array when there are no matching orders', async () => {
    const supabase = createSupabaseMock({
      from: {
        tbl_dish: ok([{ dsh_id: 1 }]),
        tbl_order_items: ok([{ oi_order_id: 10, oi_dish_id: 1 }]),
        tbl_order: ok([]),
      },
    })

    const result = await getChefOrders(supabase, 5)

    expect(result).toEqual([])
  })

  it('assembles orders with their items and dish names', async () => {
    const supabase = createSupabaseMock({
      from: {
        tbl_dish: [
          ok([{ dsh_id: 1 }]), // first call: this chef's dish ids
          ok([{ dsh_id: 1, dsh_name: 'Butter Chicken' }]), // second call: names lookup
        ],
        tbl_order_items: ok([
          { oi_id: 100, oi_order_id: 10, oi_dish_id: 1, oi_quantity: 2, oi_unit_price: 250, oi_subtotal: 500 },
        ]),
        tbl_order: ok([
          {
            ord_id: 10,
            ord_status: 'confirmed',
            ord_total_amount: 500,
            ord_delivery_address: '221B Baker Street',
            ord_order_date: '2026-01-01',
            ord_delivered_at: null,
          },
        ]),
      },
    })

    const result = await getChefOrders(supabase, 5)

    expect(result).toHaveLength(1)
    expect(result[0].ord_id).toBe(10)
    expect(result[0].items).toHaveLength(1)
    expect(result[0].items[0].dish_name).toBe('Butter Chicken')
  })

  it('falls back to a generic dish name when the dish lookup is missing a match', async () => {
    const supabase = createSupabaseMock({
      from: {
        tbl_dish: [ok([{ dsh_id: 1 }]), ok([])],
        tbl_order_items: ok([
          { oi_id: 100, oi_order_id: 10, oi_dish_id: 1, oi_quantity: 1, oi_unit_price: 100, oi_subtotal: 100 },
        ]),
        tbl_order: ok([
          {
            ord_id: 10,
            ord_status: 'pending',
            ord_total_amount: 100,
            ord_delivery_address: 'Somewhere',
            ord_order_date: '2026-01-02',
            ord_delivered_at: null,
          },
        ]),
      },
    })

    const result = await getChefOrders(supabase, 5)

    expect(result[0].items[0].dish_name).toBe('Dish')
  })

  it('requests only active orders when activeOnly is set', async () => {
    const supabase = createSupabaseMock({
      from: {
        tbl_dish: [ok([{ dsh_id: 1 }]), ok([{ dsh_id: 1, dsh_name: 'Pasta' }])],
        tbl_order_items: ok([{ oi_id: 1, oi_order_id: 10, oi_dish_id: 1, oi_quantity: 1, oi_unit_price: 10, oi_subtotal: 10 }]),
        tbl_order: ok([
          {
            ord_id: 10,
            ord_status: 'confirmed',
            ord_total_amount: 10,
            ord_delivery_address: 'Addr',
            ord_order_date: '2026-01-03',
            ord_delivered_at: null,
          },
        ]),
      },
    })

    const result = await getChefOrders(supabase, 5, { activeOnly: true })

    expect(result).toHaveLength(1)
  })
})
