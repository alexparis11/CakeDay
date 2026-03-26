import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import stripe from "@/lib/stripe"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  // Read raw body as Buffer — required for Stripe signature verification
  const body = await request.arrayBuffer()
  const rawBody = Buffer.from(body)

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Service-role client to bypass RLS for subscription updates
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = subscription.status === "active" ? "active" : "inactive"

        await supabase
          .from("companies")
          .update({
            subscription_status: status,
            stripe_subscription_id: subscription.id,
          })
          .eq("stripe_customer_id", customerId)

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase
          .from("companies")
          .update({ subscription_status: "inactive" })
          .eq("stripe_customer_id", customerId)

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase
          .from("companies")
          .update({ subscription_status: "inactive" })
          .eq("stripe_customer_id", customerId)

        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase
          .from("companies")
          .update({ subscription_status: "active" })
          .eq("stripe_customer_id", customerId)

        break
      }

      default:
        // Unhandled event type — return 200 to acknowledge receipt
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

// Required: disable Next.js body parsing so we get the raw buffer
export const config = {
  api: {
    bodyParser: false,
  },
}
