import Link from 'next/link'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/shared/Button'
import { StarRating } from '@/components/shared/StarRating'
import { Badge } from '@/components/shared/Badge'

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <Badge variant="warning" className="mb-4">
            Now serving your neighborhood
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl text-gray-900 leading-tight">
            Home-cooked meals,
            <br />
            <span className="text-brand-green">from chefs next door.</span>
          </h1>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Skip the takeout. Order real, home-cooked food made by local chefs
            and delivered fresh to your door.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/browse">
              <Button size="lg">Browse chefs</Button>
            </Link>
            <Link href="/register/chef">
              <Button size="lg" variant="ghost">
                Become a chef
              </Button>
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="font-display text-2xl text-gray-900 mb-6">
            Loved by the neighborhood
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: 'Amara K.', quote: 'Tastes just like home. Ordering weekly now.', rating: 5 },
              { name: 'Rafi H.', quote: 'Found my favorite biryani chef through this app.', rating: 4.5 },
              { name: 'Priya S.', quote: 'Delivery was fast and the food was still warm.', rating: 5 },
            ].map((r) => (
              <div
                key={r.name}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              >
                <StarRating rating={r.rating} size={14} />
                <p className="mt-3 text-sm text-gray-600">&ldquo;{r.quote}&rdquo;</p>
                <p className="mt-3 text-sm font-medium text-gray-900">{r.name}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
