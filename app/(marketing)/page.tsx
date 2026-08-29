import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/shared/Button'
import { StarRating } from '@/components/shared/StarRating'
import { Reveal } from '@/components/shared/Reveal'
import { PersonalizedHome } from '@/components/shared/PersonalizedHome'
import { createClient } from '@/lib/supabase/server'
import { getCustomerId } from '@/lib/actions/customer-helpers'
import { getChefId, getChefOrderIds } from '@/lib/actions/chef-helpers'
import { formatCurrency } from '@/lib/utils'

const ROTATIONS = ['-rotate-2', 'rotate-2', 'rotate-1', '-rotate-1']

const STEPS = [
  {
    n: '01',
    title: 'Find a kitchen near you',
    body: 'Browse home chefs cooking in your neighborhood, by cuisine or by dish.',
  },
  {
    n: '02',
    title: 'They cook it fresh, for you',
    body: 'No steam trays, no prep-ahead batches. Your order goes into the pan after you place it.',
  },
  {
    n: '03',
    title: 'It arrives still warm',
    body: 'Track it from stove to doorstep, live, right from your order page.',
  },
]

type FeaturedDish = {
  dsh_id: number
  dsh_name: string
  dsh_price: number | string
  dsh_image_url: string | null
  tbl_chef_profile: { tbl_users: { usr_full_name: string } | null } | null
}

type FeaturedReview = {
  rv_rating: number
  rv_comment: string | null
  tbl_customer: { tbl_users: { usr_full_name: string } | null } | null
  tbl_order: {
    tbl_order_items: { tbl_dish: { dsh_name: string } | null }[] | null
  } | null
}

export default async function LandingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Logged-in users get a personalized home instead of the public
  // marketing page — different job (get a returning user back into their
  // flow) from the public page's job (convince a stranger to sign up).
  if (user) {
    const role = user.user_metadata?.role as 'customer' | 'chef' | undefined
    const { data: profile } = await supabase
      .from('tbl_users')
      .select('usr_full_name')
      .eq('usr_id', user.id)
      .single()
    const name = profile?.usr_full_name ?? 'there'

    if (role === 'chef') {
      const chefId = await getChefId(supabase, user.id)
      const { data: chefProfile } = await supabase
        .from('tbl_chef_profile')
        .select('chf_verification_status')
        .eq('chf_user_id', user.id)
        .single()

      let pendingOrderCount = 0
      if (chefId) {
        const orderIds = await getChefOrderIds(supabase, chefId)
        if (orderIds.length) {
          const { count } = await supabase
            .from('tbl_order')
            .select('*', { count: 'exact', head: true })
            .in('ord_id', orderIds)
            .not('ord_status', 'in', '("delivered","cancelled")')
          pendingOrderCount = count ?? 0
        }
      }

      return (
        <PersonalizedHome
          data={{
            role: 'chef',
            name,
            pendingOrderCount,
            isVerified: chefProfile?.chf_verification_status === 'verified',
          }}
        />
      )
    }

    const customerId = await getCustomerId(supabase, user.id)
    let activeOrder = null
    if (customerId) {
      const { data } = await supabase
        .from('tbl_order')
        .select('ord_id, ord_status, ord_total_amount')
        .eq('ord_customer_id', customerId)
        .not('ord_status', 'in', '("delivered","cancelled")')
        .order('ord_order_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      activeOrder = data
    }

    return <PersonalizedHome data={{ role: 'customer', name, activeOrder }} />
  }

  // Real dishes with real uploaded photos, from verified chefs only —
  // no fallback to unverified/pending chefs' dishes on the public landing page
  const { data: dishes } = await supabase
    .from('tbl_dish')
    .select('dsh_id, dsh_name, dsh_price, dsh_image_url, tbl_chef_profile!inner(tbl_users(usr_full_name), chf_verification_status)')
    .eq('dsh_is_available', true)
    .eq('tbl_chef_profile.chf_verification_status', 'verified')
    .not('dsh_image_url', 'is', null)
    .limit(4)
    .returns<FeaturedDish[]>()

  const { data: reviews } = await supabase
    .from('tbl_review')
    .select(
      'rv_rating, rv_comment, tbl_customer(tbl_users(usr_full_name)), tbl_order:rv_order_id(tbl_order_items(tbl_dish(dsh_name)))'
    )
    .not('rv_comment', 'is', null)
    .order('rv_created_at', { ascending: false })
    .limit(3)
    .returns<FeaturedReview[]>()

  const hasFeaturedDishes = dishes && dishes.length > 0
  const hasReviews = reviews && reviews.length > 0

  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center overflow-hidden">
          {/* Decorative gradient blobs — slow, subtle, brand-colored */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-brand-gold rounded-full blur-3xl animate-pulse-slow" />
          <div className="pointer-events-none absolute top-1/3 -right-16 w-80 h-80 bg-brand-green rounded-full blur-3xl animate-pulse-slow" />

          {/* Logo watermark — subtle, sits behind everything */}
          <Image
            src="/logo.jpeg"
            alt=""
            width={700}
            height={700}
            aria-hidden="true"
            className="pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] z-0"
          />

          <Reveal className="relative z-10">
            <p className="font-mono text-xs tracking-widest text-brand-green uppercase mb-4">
              Now cooking in your neighborhood
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-gray-900 leading-[1.1]">
              Someone nearby is
              <br />
              already cooking
              <br />
              <span className="text-brand-green italic">your next meal.</span>
            </h1>
            <p className="mt-5 text-gray-600 max-w-md">
              Not a restaurant, not a ghost kitchen — real home cooks in your
              area, making the food they'd feed their own family, for yours.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link href="/browse">
                <Button size="lg">Browse chefs</Button>
              </Link>
              <Link href="/register/chef">
                <Button size="lg" variant="ghost">
                  Cook on ChefNextDoor
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* Signature element: tilted order-ticket collage, real dish photos when available */}
          <div className="relative z-10 grid grid-cols-2 gap-4 sm:gap-5">
            {hasFeaturedDishes
              ? dishes!.map((dish, i) => (
                  <Reveal key={dish.dsh_id} delay={i * 120}>
                    <div
                      className={`bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden ${ROTATIONS[i]} hover:rotate-0 hover:scale-105 hover:shadow-lg hover:z-10 transition-transform duration-200`}
                    >
                      <div className="relative h-28 sm:h-32 w-full bg-brand-cream">
                        <Image
                          src={dish.dsh_image_url!}
                          alt={dish.dsh_name}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-display text-sm text-gray-900 leading-tight truncate">
                          {dish.dsh_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          by {dish.tbl_chef_profile?.tbl_users?.usr_full_name ?? 'a local chef'}
                        </p>
                        <p className="font-mono text-sm text-brand-green mt-1">
                          {formatCurrency(Number(dish.dsh_price))}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))
              : ['🍛', '🥟', '🍲', '🍚'].map((emoji, i) => (
                  <Reveal key={emoji} delay={i * 120}>
                    <div
                      className={`bg-white border border-gray-200 rounded-lg shadow-md p-4 h-28 sm:h-32 flex flex-col items-center justify-center ${ROTATIONS[i]} hover:rotate-0 hover:scale-105 hover:shadow-lg hover:z-10 transition-transform duration-200`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <p className="font-display text-sm text-gray-400 mt-2">Coming soon</p>
                    </div>
                  </Reveal>
                ))}
          </div>
        </section>

        {/* How it works — a real sequence, so numbering earns its place */}
        <section className="bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <Reveal>
              <h2 className="font-display text-2xl text-gray-900 mb-10">
                From their stove to your door
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-3 gap-10">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 150}>
                  <span className="font-mono text-sm text-brand-gold">{s.n}</span>
                  <h3 className="font-display text-lg text-gray-900 mt-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{s.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews — real ones, styled as the same ticket language as the hero */}
        {hasReviews && (
          <section className="max-w-6xl mx-auto px-4 py-16">
            <Reveal>
              <h2 className="font-display text-2xl text-gray-900 mb-8">
                What the neighborhood's saying
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-3 gap-6">
              {reviews!.map((r, i) => {
                const dishName = r.tbl_order?.tbl_order_items?.[0]?.tbl_dish?.dsh_name
                const reviewerName = r.tbl_customer?.tbl_users?.usr_full_name ?? 'A customer'
                return (
                  <Reveal key={i} delay={i * 120}>
                    <div className="bg-brand-cream border border-gray-200 rounded-lg p-5 hover:-rotate-1 hover:scale-[1.02] transition-transform duration-200">
                      <StarRating rating={r.rv_rating} size={14} />
                      <p className="mt-3 text-sm text-gray-700">&ldquo;{r.rv_comment}&rdquo;</p>
                      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{reviewerName}</span>
                        {dishName && (
                          <span className="font-mono text-xs text-gray-500">{dishName}</span>
                        )}
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </section>
        )}

        {/* Chef recruitment band */}
        <Reveal>
          <section className="bg-brand-green">
            <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl text-white">
                  Good at what you cook? Get paid for it.
                </h2>
                <p className="text-white/70 mt-2 max-w-md">
                  Set your own menu, your own hours, your own prices. We handle
                  orders and delivery.
                </p>
              </div>
              <Link href="/register/chef">
                <Button size="lg" className="bg-brand-gold hover:bg-brand-gold/90 shrink-0">
                  Start cooking
                </Button>
              </Link>
            </div>
          </section>
        </Reveal>
      </main>

      <Footer />
    </>
  )
}
