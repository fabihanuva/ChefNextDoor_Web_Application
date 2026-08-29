# ChefNextDoor

A home-cooked food delivery platform connecting customers with local home
chefs. Three roles: **Customers** (browse, order, review), **Chefs** (list
dishes, manage orders, earn revenue), and **Admins** (standalone platform
management — never linked to regular user auth).

Originally built as a PHP 8 / MySQL MVC application, then rewritten in
Next.js (App Router) + Supabase (Postgres, Auth, Storage, Realtime, Edge
Functions).

## Tech stack

- **Frontend**: Next.js (App Router), Tailwind CSS v4, React Hook Form + Zod
- **Backend**: Supabase — Postgres, Auth, Row Level Security, Storage,
  Realtime, Edge Functions
- **Email**: Resend
- **Testing**: Jest, ~96% statement coverage across 148 tests

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase
   project URL, publishable key, and secret key
3. Run the schema in `chefnextdoor_schema.sql` via the Supabase SQL Editor,
   followed by each phase's RLS policy file in order
4. `npm run dev`

Optionally run `node -r dotenv/config scripts/seed.mjs
dotenv_config_path=.env.local` to populate demo chefs, dishes, and orders.

---

## Design patterns

Four patterns were required by the course brief. Each is implemented using
whatever mechanism is idiomatic to this stack (TypeScript functions and
Postgres/Supabase primitives) rather than a direct class-for-class port of
the original PHP OOP version — the intent of each pattern is preserved, the
mechanism isn't.

| Pattern | Where | Why this pattern, not the obvious alternative |
|---|---|---|
| **Singleton** | `lib/supabase/client.ts`, `server.ts`, `admin.ts` | One controlled construction point per context (browser / server / admin) instead of instantiating a Supabase client wherever needed. Getting the client config wrong (wrong key, wrong cookie strategy) is a security bug, not a style issue — centralizing it means that mistake can only be made once, in one file. `admin.ts` in particular is the *only* place the service-role secret is ever used, guarded by `server-only`. |
| **Strategy** | `lib/strategies/deliveryFee.ts` | Checkout calls `activeDeliveryFeeStrategy()` without knowing how the fee is calculated. Delivery pricing is a business rule that changes independently of the checkout flow (promotions, distance tiers, partner rates) — isolating it means checkout's code never changes when the pricing *policy* changes. |
| **Observer** | `hooks/useRealtimeOrder.ts` (subscriber) + `lib/actions/chefOrder.ts` (publisher), and independently a Database Webhook on `tbl_order` → `supabase/functions/send-order-email` (a second subscriber) | Two observers watch the same subject (an order's status) with zero coupling between them. The chef's Server Action that updates `ord_status` has no idea the customer's browser is watching live, and no idea an email is about to fire. New subscribers (an admin alert, an SMS ping) can be added later without touching the code that changes the order. |
| **Facade** | `lib/email/mailer.ts` | Every call site sends email through `sendEmail()` or a named helper, never touching the Resend SDK directly. Swapping providers later means editing one file, not every call site. |

Full write-up with more detail on each pattern's trade-offs: see
[`DESIGN_PATTERNS.md`](./DESIGN_PATTERNS.md).

## Project structure

```
app/
  (marketing)/     — landing page
  (auth)/          — login, register (customer + chef)
  (customer)/      — browse, cart, checkout, orders, favorites, profile
  chef/            — dashboard, dishes, orders, earnings, profile
  admin/           — standalone admin panel (dashboard, chefs, users, ...)
  api/search/      — dish search route handler
lib/
  actions/         — Server Actions, grouped by domain
  strategies/       — Strategy pattern (delivery fee)
  supabase/        — Singleton client wrappers
  email/           — Facade (mailer)
supabase/functions/ — Edge Functions (order status emails)
components/
  shared/          — Button, Badge, Navbar, EmptyState, etc.
  customer/ chef/ admin/ — role-specific components
```
