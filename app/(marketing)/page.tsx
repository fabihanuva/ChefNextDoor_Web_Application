import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/shared/Button'
import { StarRating } from '@/components/shared/StarRating'

const TICKETS = [
  { emoji: '🍛', dish: 'Beef Bhuna', cook: 'Rina', price: '৳320', rotate: '-rotate-3' },
  { emoji: '🥟', dish: 'Steamed Momo', cook: 'Tenzin', price: '৳180', rotate: 'rotate-2' },
  { emoji: '🍲', dish: 'Chingri Malai', cook: 'Nasrin', price: '৳450', rotate: '-rotate-1' },
  { emoji: '🍚', dish: 'Kacchi Biryani', cook: 'Shafiq', price: '৳380', rotate: 'rotate-3' },
]

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

const REVIEWS = [
  { name: 'Amara K.', quote: 'Tastes just like home. Ordering weekly now.', rating: 5, dish: 'Beef Bhuna' },
  { name: 'Rafi H.', quote: 'Found my favorite biryani cook through this app.', rating: 4.5, dish: 'Kacchi Biryani' },
  { name: 'Priya S.', quote: 'Delivery was fast and the food was still warm.', rating: 5, dish: 'Chingri Malai' },
]

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center overflow-hidden">
          {/* Logo watermark — subtle, sits behind everything */}
          <Image
            src="/logo.jpeg"
            alt=""
            width={700}
            height={700}
            aria-hidden="true"
            className="pointer-events-none select-none absolute -top-24 -right-32 opacity-[0.06] z-0"
          />

          <div className="relative z-10">
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
          </div>

          {/* Signature element: tilted order-ticket collage */}
          <div className="relative h-80 sm:h-96">
            {TICKETS.map((t, i) => (
              <div
                key={t.dish}
                className={`absolute bg-white border border-gray-200 rounded-lg shadow-md p-4 w-44 ${t.rotate} hover:rotate-0 hover:scale-105 transition-transform duration-200`}
                style={{
                  top: `${[8, 0, 42, 48][i]}%`,
                  left: `${[2, 50, 0, 52][i]}%`,
                }}
              >
                <span className="text-2xl">{t.emoji}</span>
                <p className="font-display text-base text-gray-900 mt-2 leading-tight">
                  {t.dish}
                </p>
                <p className="text-xs text-gray-500 mt-1">by {t.cook}</p>
                <p className="font-mono text-sm text-brand-green mt-2">{t.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works — a real sequence, so numbering earns its place */}
        <section className="bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="font-display text-2xl text-gray-900 mb-10">
              From their stove to your door
            </h2>
            <div className="grid sm:grid-cols-3 gap-10">
              {STEPS.map((s) => (
                <div key={s.n}>
                  <span className="font-mono text-sm text-brand-gold">{s.n}</span>
                  <h3 className="font-display text-lg text-gray-900 mt-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews, styled as the same ticket language as the hero */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="font-display text-2xl text-gray-900 mb-8">
            What the neighborhood's saying
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="bg-brand-cream border border-gray-200 rounded-lg p-5"
              >
                <StarRating rating={r.rating} size={14} />
                <p className="mt-3 text-sm text-gray-700">&ldquo;{r.quote}&rdquo;</p>
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{r.name}</span>
                  <span className="font-mono text-xs text-gray-500">{r.dish}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chef recruitment band */}
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
      </main>

      <Footer />
    </>
  )
}
