import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCompany } from "@/lib/services/companies"
import { getStripePortalUrl } from "@/lib/services/billing"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single()

    if (!userData?.company_id) {
      return NextResponse.json({ error: "No company found" }, { status: 400 })
    }

    const company = await getCompany(supabase, userData.company_id)
    if (!company?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer configured" }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const url = await getStripePortalUrl({
      customerId: company.stripe_customer_id,
      returnUrl: `${appUrl}/settings`,
    })

    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
