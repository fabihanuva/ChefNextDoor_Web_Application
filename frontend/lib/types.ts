/**
 * Types for the customer flow, matching the live tbl_chef_profile /
 * tbl_dish / tbl_users schema. Chef display name and avatar come from
 * the joined tbl_users row (chf_user_id -> usr_id) since tbl_chef_profile
 * itself has no business_name/avatar columns.
 */

export type ChefUserInfo = {
  usr_full_name: string
  usr_profile_image: string | null
}

export type Chef = {
  chf_id: number
  chf_user_id: string
  chf_bio: string | null
  chf_kitchen_address: string
  chf_cuisine_type: string | null
  chf_rating_avg: number
  chf_verification_status: 'pending' | 'verified' | 'rejected'
  tbl_users: ChefUserInfo | null
}

export type Dish = {
  dsh_id: number
  dsh_chef_id: number
  dsh_name: string
  dsh_description: string | null
  dsh_price: number | string // Postgres NUMERIC comes back as a string from Supabase
  dsh_category: string | null
  dsh_image_url: string | null
  dsh_is_available: boolean
}

export type CartItem = {
  dishId: number
  chefId: number // this is chf_id (tbl_chef_profile.chf_id), not the chef's auth user id
  name: string
  price: number
  imageUrl: string | null
  quantity: number
}
