export type ChefDish = {
  dsh_id: number
  dsh_chef_id: number
  dsh_name: string
  dsh_description: string | null
  dsh_price: number | string
  dsh_category: string | null
  dsh_image_url: string | null
  dsh_is_available: boolean
  dsh_created_at?: string
  dsh_updated_at?: string
}

export type ChefOrder = {
  ord_id: number
  ord_status: string
  ord_total_amount: number | string
  ord_delivery_address: string
  ord_order_date: string
  ord_delivered_at: string | null
  items: Array<{
    oi_id: number
    oi_quantity: number
    oi_unit_price: number | string
    oi_subtotal: number | string
    dish_id: number
    dish_name: string
  }>
}

export type ChefProfile = {
  chf_id: number
  chf_user_id: string
  chf_bio: string | null
  chf_kitchen_address: string
  chf_cuisine_type: string | null
  chf_rating_avg: number | string
  chf_verification_status: 'pending' | 'verified' | 'rejected'
}
