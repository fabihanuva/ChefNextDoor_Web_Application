# ChefNextDoor

ChefNextDoor is a home-cooked food delivery platform connecting customers
with local home chefs. Customers browse chefs and dishes, order, track
delivery live, and leave reviews. Chefs manage their menu, fulfill orders,
and track earnings. Admins run the platform from a standalone panel —
approving chefs, managing users, and reporting on revenue.

Originally built as a PHP 8 / MySQL MVC application (submission-ready v1,
kept on a separate branch), then rewritten as a Next.js + Supabase
full-stack app — the version in this repo.

## Features

### Customer
- Registration and login (Supabase Auth, email/password)
- Browse verified chefs and search dishes
- Add to cart (single-chef cart, enforced), checkout, real distance-based
  delivery fee (geocoded)
- Live order tracking (Supabase Realtime — no polling, no refresh)
- Leave a star rating + review on delivered orders, feeding the chef's
  average rating
- Favorite individual dishes
- Profile: photo upload, saved default delivery address, order history

### Chef
- Registration flow separate from customer signup; account starts
  `pending` until admin-approved
- Dashboard: dish grid, active order count, net earnings after platform
  fee, rating
- Dish CRUD with photo upload (Supabase Storage)
- Incoming order queue with one-tap status progression
  (confirmed → preparing → out for delivery → delivered)
- Earnings breakdown: gross sales, platform fee deducted, net take-home
- Profile: photo, bio, cuisine type, kitchen address (geocoded for
  delivery-fee calculation)

### Admin
- Standalone authentication — **not** a role on the regular user table;
  own login (`/admin/login`), own credentials table, verified server-side
  on every admin action independent of Supabase Auth
- Platform KPIs: customers, chefs, pending approvals, total orders, GMV,
  platform revenue
- Approve / reject / suspend chef accounts (each action sends an email
  notification)
- Suspend / reactivate customer accounts
- Delivery partner CRUD
- Support content CRUD
- Revenue reporting: GMV vs. platform fee vs. chef payouts, by month

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Supabase — PostgreSQL, Auth, Row Level Security, Storage, Realtime, Edge Functions |
| Email | Resend |
| Geocoding | OpenStreetMap Nominatim (free, no API key) |
| Testing | Jest |
| Deployment target | Vercel (frontend) + Supabase (managed backend) |

## Project Structure

```
ChefNextDoor_Web_Application/
├── frontend/                Next.js app (TypeScript)
│   ├── app/
│   │   ├── (marketing)/     public landing page + personalized logged-in home
│   │   ├── (auth)/          login, registration (customer + chef)
│   │   ├── (customer)/      browse, cart, checkout, orders, favorites, profile
│   │   ├── chef/            dashboard, dishes, orders, earnings, profile
│   │   ├── admin/           standalone admin panel
│   │   └── api/search/      dish search route handler
│   ├── components/
│   │   ├── shared/          Button, Navbar, EmptyState, Reveal, etc.
│   │   ├── customer/ chef/ admin/   role-specific components
│   ├── lib/
│   │   ├── actions/         Server Actions, grouped by domain
│   │   ├── strategies/      Strategy pattern (delivery fee)
│   │   ├── supabase/        Singleton client wrappers (browser/server/admin)
│   │   └── email/           Facade (Resend)
│   ├── hooks/                useRealtimeOrder (Observer, client side)
│   ├── tests/                Jest test suite
│   └── public/
└── supabase/
    ├── migrations/           full schema + every RLS policy, numbered in order
    └── functions/            Edge Functions (order-status email notifications)
```

## Entity-Relationship Diagram

Full ERD: [`docs/ChefNextDoorERD.pdf`](./docs/ChefNextDoorERD.pdf)

## Database Schema

12 tables, 4 enums, PostgreSQL (Supabase). Every table and every RLS
policy — across auth, customer flow, chef flow, reviews, and admin — is
version-controlled in [`supabase/migrations/`](./supabase/migrations),
numbered in the order they should run on a fresh project. See
[`supabase/migrations/README.md`](./supabase/migrations/README.md) for
the full breakdown.

## Design Patterns

Four patterns required by the course brief — Singleton, Strategy,
Observer, Facade — implemented using whatever mechanism is idiomatic to
this stack (TypeScript functions and Postgres/Supabase primitives) rather
than a direct class-for-class port of the original PHP OOP version.

Full write-up with the "why this pattern, not the obvious alternative"
reasoning for each: [`DESIGN_PATTERNS.md`](./DESIGN_PATTERNS.md)

## Testing

Jest test suite covering Server Actions and core business logic
(delivery fee calculation, platform fee split, auth flows). Located in
[`frontend/tests/`](./frontend/tests).

```bash
cd frontend
npm test              # run once
npm run test:coverage # with coverage report, if configured
```

> Note: test count/coverage numbers should be re-verified against the
> current suite before citing a specific figure — several features
> (platform fee, geocoding, reviews) were added after the last full
> coverage run.

## Screenshots

<!--
  Fill in with actual screenshots before submission, matching this pattern:
  | Public landing | Personalized home (logged in) |
  |---|---|
  | ![Landing](./docs/screenshots/landing.png) | ![Home](./docs/screenshots/home.png) |
-->

| Landing | Browse | Chef profile |
|---|---|---|
| _screenshot_ | _screenshot_ | _screenshot_ |

| Customer checkout | Order tracking (live) | Chef dashboard |
|---|---|---|
| _screenshot_ | _screenshot_ | _screenshot_ |

| Chef orders queue | Admin dashboard | Admin chef approval |
|---|---|---|
| _screenshot_ | _screenshot_ | _screenshot_ |

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) project
- A free [Resend](https://resend.com) account (for email notifications)

### Database
1. Open your Supabase project → SQL Editor
2. Run every file in `supabase/migrations/` **in numeric order** (001 → 010)
3. Some steps need a manual dashboard action first — noted inline in the
   relevant migration file (creating Storage buckets, setting up the
   order-status Database Webhook)

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# fill in your Supabase URL/keys and Resend API key in .env.local
npm run dev
```
Runs on `http://localhost:3000`.

### Seed demo data (optional)
```bash
cd frontend
node -r dotenv/config scripts/seed.mjs dotenv_config_path=.env.local
```
Creates 5 demo chefs, 3 demo customers, dishes, delivered orders, and
reviews — all logins use the password printed at the end of the script.

## Architecture note: no separate REST API layer

Unlike a typical client/server split (a Spring Boot backend serving a
REST API, for example), this project uses Next.js **Server Actions** as
its backend — functions in `frontend/lib/actions/` that run only on the
server, callable directly from React components without a manual
fetch/endpoint layer. The only conventional API route is
`app/api/search/route.ts` (dish search). Direct table reads (chef
listings, dish browsing) go straight from Server Components to Supabase,
protected by Row Level Security rather than by an API authorization
layer — the database itself enforces who can read/write what.
