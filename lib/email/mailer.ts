import 'server-only'
import { Resend } from 'resend'

/**
 * Facade pattern: every part of the app that needs to send an email goes
 * through this one function, never touching the Resend SDK directly.
 * If you ever swap providers (SendGrid, Postmark, etc.), only this file
 * changes — nothing that calls sendEmail() needs to know or care.
 *
 * This is the Next.js-side half of your notification system. The other
 * half — order status change emails — is sent by a Supabase Edge
 * Function (see supabase/functions/send-order-email), triggered by a
 * Database Webhook on tbl_order, entirely independent of this file.
 * This facade is for emails the *app* decides to send directly: chef
 * approval/rejection/suspension notices from the admin panel, etc.
 */

const resend = new Resend(process.env.RESEND_API_KEY)

// Use Resend's onboarding sender until you verify your own domain in
// the Resend dashboard, then switch this to e.g. 'ChefNextDoor <hello@yourdomain.com>'
const FROM_ADDRESS = 'ChefNextDoor <onboarding@resend.dev>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('Email send failed:', error)
    return { error: error.message }
  }

  return { error: undefined }
}

export async function sendChefApprovedEmail(to: string, chefName: string) {
  return sendEmail({
    to,
    subject: "You're verified on ChefNextDoor!",
    html: `<p>Hi ${chefName},</p><p>Good news — your chef account has been approved. Your dishes are now visible to customers.</p>`,
  })
}

export async function sendChefRejectedEmail(to: string, chefName: string) {
  return sendEmail({
    to,
    subject: 'Your ChefNextDoor application',
    html: `<p>Hi ${chefName},</p><p>Unfortunately we're not able to approve your chef account at this time.</p>`,
  })
}

export async function sendChefSuspendedEmail(to: string, chefName: string) {
  return sendEmail({
    to,
    subject: 'Your ChefNextDoor chef account has been suspended',
    html: `<p>Hi ${chefName},</p><p>Your chef account has been suspended. Contact support if you believe this is a mistake.</p>`,
  })
}
