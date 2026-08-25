import type { ChefOrder } from '@/lib/chef/types'

export async function getChefOrders(
  supabase: any,
  chefId: number,
  options?: { activeOnly?: boolean }
): Promise<ChefOrder[]> {
  const { data: dishRows, error: dishError } = await supabase
    .from('tbl_dish')
    .select('dsh_id')
    .eq('dsh_chef_id', chefId)

  if (dishError || !dishRows?.length) return []

  const dishIds = dishRows.map((d: { dsh_id: number }) => d.dsh_id)

  const { data: itemRows, error: itemError } = await supabase
    .from('tbl_order_items')
    .select('oi_id, oi_order_id, oi_dish_id, oi_quantity, oi_unit_price, oi_subtotal')
    .in('oi_dish_id', dishIds)

  if (itemError || !itemRows?.length) return []

  const orderIds = [...new Set(itemRows.map((i: { oi_order_id: number }) => i.oi_order_id))]

  let orderQuery = supabase
    .from('tbl_order')
    .select('ord_id, ord_status, ord_total_amount, ord_delivery_address, ord_order_date, ord_delivered_at')
    .in('ord_id', orderIds)
    .order('ord_order_date', { ascending: false })

  if (options?.activeOnly) {
    orderQuery = orderQuery.not('ord_status', 'in', '("delivered","cancelled")')
  }

  const { data: orders, error: orderError } = await orderQuery
  if (orderError || !orders?.length) return []

  const { data: dishes } = await supabase
    .from('tbl_dish')
    .select('dsh_id, dsh_name')
    .in('dsh_id', dishIds)

  const dishNames = new Map((dishes ?? []).map((d: { dsh_id: number; dsh_name: string }) => [d.dsh_id, d.dsh_name]))

  return orders.map((order: any) => ({
    ord_id: order.ord_id,
    ord_status: order.ord_status,
    ord_total_amount: order.ord_total_amount,
    ord_delivery_address: order.ord_delivery_address,
    ord_order_date: order.ord_order_date,
    ord_delivered_at: order.ord_delivered_at,
    items: itemRows
      .filter((item: any) => item.oi_order_id === order.ord_id)
      .map((item: any) => ({
        oi_id: item.oi_id,
        oi_quantity: item.oi_quantity,
        oi_unit_price: item.oi_unit_price,
        oi_subtotal: item.oi_subtotal,
        dish_id: item.oi_dish_id,
        dish_name: dishNames.get(item.oi_dish_id) ?? 'Dish',
      })),
  }))
}
