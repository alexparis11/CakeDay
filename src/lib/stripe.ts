import Stripe from "stripe"

// Singleton Stripe client — server-side only
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
})

export default stripe

// Plan thresholds and price IDs
export const PLANS = {
  starter: {
    name: "Starter",
    maxEmployees: 20,
    monthlyPricePence: 4900,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
  },
  growth: {
    name: "Growth",
    maxEmployees: 50,
    monthlyPricePence: 8900,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
  },
} as const

export type PlanKey = keyof typeof PLANS

export function getPlanForHeadcount(headcount: number): PlanKey {
  if (headcount <= PLANS.starter.maxEmployees) return "starter"
  return "growth"
}
