// scripts/seed.mjs
//
// Populates the database with realistic demo data so the app doesn't look
// empty during a demo/grading session. Creates real Supabase Auth users
// (so login actually works for each seeded account), then chef profiles,
// dishes, delivered orders, and reviews.
//
// Usage:
//   npm install dotenv --save-dev
//   node -r dotenv/config scripts/seed.mjs dotenv_config_path=.env.local
//
// Safe to re-run — it skips creating a user if that email already exists,
// but will insert duplicate dishes/orders if run twice, so only run once
// per fresh database (or manually clear tbl_dish/tbl_order first).

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CHEFS = [
  {
    email: 'rina.chef@demo.chefnextdoor.test',
    fullName: 'Rina Akter',
    cuisine: 'Bengali Home Cooking',
    kitchenAddress: 'House 12, Road 5, Dhanmondi, Dhaka',
    bio: 'Cooking the recipes my grandmother taught me, one order at a time.',
    dishes: [
      { name: 'Beef Bhuna', price: 320, description: 'Slow-cooked beef in a rich, dark masala.' },
      { name: 'Chingri Malai Curry', price: 450, description: 'Prawns simmered in coconut milk.' },
      { name: 'Bhorta Platter', price: 180, description: 'Mashed potato, eggplant, and dal bhorta with rice.' },
    ],
  },
  {
    email: 'shafiq.chef@demo.chefnextdoor.test',
    fullName: 'Shafiq Rahman',
    cuisine: 'Biryani & Mughlai',
    kitchenAddress: 'Flat 3B, Green Road, Dhaka',
    bio: 'Third-generation biryani cook. Slow-cooked, always dum-style.',
    dishes: [
      { name: 'Kacchi Biryani', price: 380, description: 'Traditional dum-cooked mutton biryani.' },
      { name: 'Chicken Rezala', price: 340, description: 'Mild, creamy Mughlai chicken curry.' },
      { name: 'Shahi Tehari', price: 300, description: 'Fragrant beef tehari with whole spices.' },
    ],
  },
  {
    email: 'nasrin.chef@demo.chefnextdoor.test',
    fullName: 'Nasrin Sultana',
    cuisine: 'Seafood & Coastal',
    kitchenAddress: 'Road 11, Banani, Dhaka',
    bio: 'Fresh catch, cooked the Chittagong way.',
    dishes: [
      { name: 'Ilish Bhapa', price: 420, description: 'Steamed hilsa in mustard sauce.' },
      { name: 'Fish Curry with Rice', price: 280, description: 'Everyday-style rui fish curry.' },
    ],
  },
  {
    email: 'tenzin.chef@demo.chefnextdoor.test',
    fullName: 'Tenzin Dolma',
    cuisine: 'Tibetan & Nepali',
    kitchenAddress: 'Road 27, Gulshan, Dhaka',
    bio: 'Handmade momo and thukpa, just like home.',
    dishes: [
      { name: 'Steamed Chicken Momo', price: 180, description: '10 pieces, served with spicy achar.' },
      { name: 'Beef Thukpa', price: 220, description: 'Hearty noodle soup, Himalayan style.' },
    ],
  },
  {
    email: 'karim.chef@demo.chefnextdoor.test',
    fullName: 'Abdul Karim',
    cuisine: 'Street Food & Snacks',
    kitchenAddress: 'Old Dhaka, Chawkbazar',
    bio: 'Old Dhaka street food, made cleaner and delivered hot.',
    dishes: [
      { name: 'Fuchka (6 pcs)', price: 90, description: 'Classic tangy, spicy fuchka.' },
      { name: 'Chotpoti', price: 110, description: 'Spiced chickpea and potato street snack.' },
      { name: 'Beef Kala Bhuna', price: 350, description: 'Dark, intensely spiced slow-cooked beef.' },
    ],
  },
]

const CUSTOMERS = [
  { email: 'amara.customer@demo.chefnextdoor.test', fullName: 'Amara Khan', phone: '01700000001' },
  { email: 'rafi.customer@demo.chefnextdoor.test', fullName: 'Rafi Hossain', phone: '01700000002' },
  { email: 'priya.customer@demo.chefnextdoor.test', fullName: 'Priya Saha', phone: '01700000003' },
]

const DEMO_PASSWORD = 'DemoPass123!'

async function getOrCreateAuthUser(email, role, fullName) {
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find((u) => u.email === email)
  if (found) return found.id

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { role, full_name: fullName },
  })
  if (error) throw new Error(`Creating ${email}: ${error.message}`)
  return data.user.id
}

async function main() {
  console.log('Seeding demo data...')

  const { data: paymentMethods } = await supabase.from('tbl_payment_method').select('pm_id').limit(1)
  const paymentMethodId = paymentMethods?.[0]?.pm_id
  if (!paymentMethodId) throw new Error('No payment methods found — run the main schema first.')

  const chefIds = []

  for (const chef of CHEFS) {
    const userId = await getOrCreateAuthUser(chef.email, 'chef', chef.fullName)

    // The handle_new_user trigger creates tbl_users automatically — give
    // it a moment, then fill in the phone/name if not already set.
    await supabase.from('tbl_users').update({ usr_full_name: chef.fullName }).eq('usr_id', userId)

    const { data: existingProfile } = await supabase
      .from('tbl_chef_profile')
      .select('chf_id')
      .eq('chf_user_id', userId)
      .maybeSingle()

    let chefId = existingProfile?.chf_id

    if (!chefId) {
      const { data: profile, error } = await supabase
        .from('tbl_chef_profile')
        .insert({
          chf_user_id: userId,
          chf_bio: chef.bio,
          chf_kitchen_address: chef.kitchenAddress,
          chf_cuisine_type: chef.cuisine,
          chf_verification_status: 'verified',
        })
        .select('chf_id')
        .single()
      if (error) throw new Error(`Chef profile for ${chef.email}: ${error.message}`)
      chefId = profile.chf_id
    }

    chefIds.push({ chefId, dishes: chef.dishes })

    for (const dish of chef.dishes) {
      const { data: existingDish } = await supabase
        .from('tbl_dish')
        .select('dsh_id')
        .eq('dsh_chef_id', chefId)
        .eq('dsh_name', dish.name)
        .maybeSingle()

      if (!existingDish) {
        await supabase.from('tbl_dish').insert({
          dsh_chef_id: chefId,
          dsh_name: dish.name,
          dsh_description: dish.description,
          dsh_price: dish.price,
          dsh_is_available: true,
        })
      }
    }
    console.log(`  chef: ${chef.fullName} (${chef.dishes.length} dishes)`)
  }

  const customerIds = []
  for (const customer of CUSTOMERS) {
    const userId = await getOrCreateAuthUser(customer.email, 'customer', customer.fullName)
    await supabase
      .from('tbl_users')
      .update({ usr_full_name: customer.fullName, usr_phone: customer.phone })
      .eq('usr_id', userId)

    const { data: existingCustomer } = await supabase
      .from('tbl_customer')
      .select('cs_id')
      .eq('cs_user_id', userId)
      .maybeSingle()

    let customerId = existingCustomer?.cs_id
    if (!customerId) {
      const { data: created, error } = await supabase
        .from('tbl_customer')
        .insert({ cs_user_id: userId })
        .select('cs_id')
        .single()
      if (error) throw new Error(`Customer for ${customer.email}: ${error.message}`)
      customerId = created.cs_id
    }
    customerIds.push(customerId)
  }
  console.log(`  ${CUSTOMERS.length} customers created`)

  // A handful of delivered orders with reviews, so earnings/revenue/rating
  // stats have real numbers to show instead of zeros.
  const reviewComments = [
    'Tastes just like home cooking. Will order again.',
    'Arrived hot and fast. Loved it.',
    'Best biryani I have had delivered.',
    'Portion size was generous, great value.',
    'Absolutely delicious, ordering weekly now.',
  ]

  let orderCount = 0
  for (const { chefId, dishes } of chefIds) {
    const { data: chefDishes } = await supabase
      .from('tbl_dish')
      .select('dsh_id, dsh_price, dsh_name')
      .eq('dsh_chef_id', chefId)

    if (!chefDishes || chefDishes.length === 0) continue

    for (let i = 0; i < 2; i++) {
      const customerId = customerIds[(orderCount + i) % customerIds.length]
      const dish = chefDishes[i % chefDishes.length]
      const quantity = 1 + (i % 2)
      const subtotal = Number(dish.dsh_price) * quantity
      const deliveryFee = 40
      const total = subtotal + deliveryFee

      const { data: order, error: orderError } = await supabase
        .from('tbl_order')
        .insert({
          ord_customer_id: customerId,
          ord_payment_method_id: paymentMethodId,
          ord_status: 'delivered',
          ord_total_amount: total,
          ord_delivery_address: 'Demo address, Dhaka',
          ord_delivered_at: new Date().toISOString(),
        })
        .select('ord_id')
        .single()

      if (orderError) {
        console.warn(`  order skipped: ${orderError.message}`)
        continue
      }

      await supabase.from('tbl_order_items').insert({
        oi_order_id: order.ord_id,
        oi_dish_id: dish.dsh_id,
        oi_quantity: quantity,
        oi_unit_price: dish.dsh_price,
        oi_subtotal: subtotal,
      })

      await supabase.from('tbl_review').insert({
        rv_order_id: order.ord_id,
        rv_customer_id: customerId,
        rv_rating: 4 + (orderCount % 2), // alternates 4 and 5 stars
        rv_comment: reviewComments[orderCount % reviewComments.length],
      })

      orderCount++
    }
  }
  console.log(`  ${orderCount} delivered demo orders with reviews created`)

  // Recompute each chef's rating average from the reviews just created
  for (const { chefId } of chefIds) {
    const { data: chefOrders } = await supabase
      .from('tbl_dish')
      .select('dsh_id')
      .eq('dsh_chef_id', chefId)

    const dishIds = chefOrders?.map((d) => d.dsh_id) ?? []
    if (dishIds.length === 0) continue

    const { data: items } = await supabase
      .from('tbl_order_items')
      .select('oi_order_id')
      .in('oi_dish_id', dishIds)

    const orderIds = [...new Set(items?.map((i) => i.oi_order_id) ?? [])]
    if (orderIds.length === 0) continue

    const { data: reviews } = await supabase
      .from('tbl_review')
      .select('rv_rating')
      .in('rv_order_id', orderIds)

    if (!reviews || reviews.length === 0) continue

    const avg = reviews.reduce((sum, r) => sum + r.rv_rating, 0) / reviews.length
    await supabase
      .from('tbl_chef_profile')
      .update({ chf_rating_avg: Math.round(avg * 100) / 100 })
      .eq('chf_id', chefId)
  }

  console.log('\nDone. All seeded accounts use the password:', DEMO_PASSWORD)
  console.log('Chef logins:', CHEFS.map((c) => c.email).join(', '))
  console.log('Customer logins:', CUSTOMERS.map((c) => c.email).join(', '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
