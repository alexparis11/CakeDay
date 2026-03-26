import "server-only"
import stripe, { getPlanForHeadcount, PLANS } from "@/lib/stripe"

export async function createStripeCustomer(params: {
  name: string
  email: string
}): Promise<string> {
  const customer = await stripe.customers.create({
    name: params.name,
    email: params.email,
    metadata: { platform: "cakeday" },
  })
  return customer.id
}

export async function createStripeSubscription(params: {
  customerId: string
  headcount: number
}): Promise<string> {
  const plan = getPlanForHeadcount(params.headcount)
  const priceId = PLANS[plan].priceId

  const subscription = await stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  })

  return subscription.id
}

export async function getStripePortalUrl(params: {
  customerId: string
  returnUrl: string
}): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })
  return session.url
}

export async function cancelStripeSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.cancel(subscriptionId)
}
