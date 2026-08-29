# Design Patterns in ChefNextDoor

This document maps the four design patterns required by the course brief to
where they actually live in the codebase, and explains why each pattern fit
the problem better than the obvious alternative.

---

## 1. Singleton — Supabase client wrappers

**Files:** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`

Every part of the app that talks to Supabase goes through one of these three
functions rather than constructing a client inline. This matters for two
reasons specific to Next.js's App Router:

- **Correctness**: the server client must read/write auth cookies per-request
  (`createServerClient` inside `server.ts`), so it can't actually be a
  traditional single shared instance — it's re-created per request, but from
  one controlled construction point. This is the "one source of truth for
  how a client is built" reading of Singleton, adapted to a serverless
  request-scoped environment rather than the classic one-instance-forever
  version you'd use in the PHP original.
- **Security boundary**: `admin.ts` is the *only* place the service-role
  secret key is ever used, guarded by the `server-only` import so it can't
  accidentally end up in client-bundled code. Centralizing this in one file
  makes the security boundary auditable — there's exactly one place to check.

**Why not just instantiate `createClient()` wherever needed?** Because the
correct client configuration (which key, which cookie strategy) differs by
context (browser vs. server vs. admin), and getting that wrong is a security
bug, not just a style issue. Centralizing it means that mistake can only be
made once, in one file, instead of at every call site.

---

## 2. Strategy — delivery fee calculation

**File:** `lib/strategies/deliveryFee.ts`

`activeDeliveryFeeStrategy(params)` is called from checkout without the
caller needing to know *how* the fee is calculated — flat rate, distance-based,
or per-delivery-partner. Swapping the algorithm means changing which function
this points to, not rewriting every place a delivery fee is calculated.

**Why not just inline the formula in checkout?** Because delivery pricing is
exactly the kind of business rule that changes independently of the checkout
flow itself (promotions, distance tiers, partner-specific rates). Isolating
it means checkout's code never needs to change when the pricing *policy*
changes.

---

## 3. Observer — order status notifications

**Files:** `hooks/useRealtimeOrder.ts` (subscriber), `lib/actions/chefOrder.ts`
(publisher), `supabase/functions/send-order-email` + Database Webhook on
`tbl_order` (a second, independent subscriber)

This is actually **two observers watching the same subject** (an order's
status), which is a clean illustration of the pattern:

- The customer's browser subscribes to `tbl_order` UPDATE events via Supabase
  Realtime and updates the tracking UI live, with zero polling.
- Independently, a Database Webhook on the same table fires a Supabase Edge
  Function that sends an email — the chef's Server Action that updates
  `ord_status` has no idea this email exists, no idea the customer's browser
  is watching, and doesn't need to.

**Why not just call `sendEmail()` directly inside `updateOrderStatus`?**
That was the simpler option, and it works — but it couples order-status logic
to notification logic. Any *other* future subscriber (an admin dashboard
alert, an SMS notification, a delivery-partner ping) would mean editing
`updateOrderStatus` again. With the DB-trigger approach, new subscribers are
added independently of the code that changes the order.

---

## 4. Facade — email sending

**File:** `lib/email/mailer.ts`

Every call site that needs to send an email calls `sendEmail()` or one of the
named helpers (`sendChefApprovedEmail`, etc.) — none of them import the
Resend SDK directly or know its API shape.

**Why not just call `resend.emails.send()` from each Server Action?** Because
then swapping providers (Resend → SendGrid, say) means finding and editing
every call site. With the facade, it's one file.

---

## Where the patterns diverge from a textbook OOP implementation

The original PHP version of this project likely implemented these as actual
classes (a `DeliveryFeeStrategy` interface with concrete subclasses, an
`OrderSubject` with `attach()`/`notify()`). This rewrite uses TypeScript
functions and Postgres/Supabase primitives instead of class hierarchies —
the *intent* of each pattern (interchangeable algorithms, decoupled
notification, one construction point, one integration point) is preserved,
but the mechanism is idiomatic to a serverless Next.js + Postgres stack
rather than a direct class-for-class port.
