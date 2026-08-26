// supabase/functions/send-order-email/index.ts
//
// Deno Edge Function — runs on Supabase's infrastructure, NOT inside
// Next.js. This is the Observer half of your order pipeline: a Database
// Webhook (configured in the dashboard, or via the SQL trigger in
// phase9_order_email_trigger.sql) fires this function every time
// tbl_order.ord_status changes, completely decoupled from whichever
// client (customer app, chef app, admin panel) made the change.
//
// Deploy with:
//   supabase functions deploy send-order-email
//
// Secrets (separate from your Next.js .env.local — these live in
// Supabase's own environment):
//   supabase secrets set RESEND_API_KEY=your_key
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_secret_key
//   (SUPABASE_URL is provided automatically by the Edge Runtime)

import { createClient } from 'jsr:@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
// SUPABASE_URL is auto-injected by the Edge Runtime — Supabase reserves
// the SUPABASE_ prefix for its own variables, so the service-role key
// must be set under a different custom name.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY')!

const STATUS_MESSAGES: Record<string, string> = {
  confirmed: 'Your order has been confirmed by the chef.',
  preparing: 'Your chef has started preparing your order.',
  out_for_delivery: 'Your order is on its way!',
  delivered: 'Your order has been delivered. Enjoy your meal!',
  cancelled: 'Your order has been cancelled.',
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    // Database Webhook payload shape: { type, table, record, old_record }
    const order = payload.record
    const previousStatus = payload.old_record?.ord_status
    const newStatus = order?.ord_status

    // Only email on an actual status change, not on other order edits
    if (!newStatus || newStatus === previousStatus) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const message = STATUS_MESSAGES[newStatus]
    if (!message) {
      return new Response(JSON.stringify({ skipped: 'no template for status' }), {
        status: 200,
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // ord_customer_id -> tbl_customer.cs_id -> tbl_users.usr_email
    const { data: customer } = await supabase
      .from('tbl_customer')
      .select('tbl_users(usr_email, usr_full_name)')
      .eq('cs_id', order.ord_customer_id)
      .single()

    const email = customer?.tbl_users?.usr_email
    const name = customer?.tbl_users?.usr_full_name ?? 'there'

    if (!email) {
      return new Response(JSON.stringify({ error: 'No customer email found' }), {
        status: 200,
      })
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ChefNextDoor <onboarding@resend.dev>',
        to: email,
        subject: `Order #${order.ord_id} update`,
        html: `<p>Hi ${name},</p><p>${message}</p>`,
      }),
    })

    if (!resendResponse.ok) {
      const errText = await resendResponse.text()
      return new Response(JSON.stringify({ error: errText }), { status: 200 })
    }

    return new Response(JSON.stringify({ sent: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 200 })
  }
})
