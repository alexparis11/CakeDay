import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createCompany, updateCompany } from "@/lib/services/companies"
import { createStripeCustomer, createStripeSubscription } from "@/lib/services/billing"
import resend, { FROM_EMAIL } from "@/lib/resend"
import { render } from "@react-email/render"
import WelcomeEmail from "../../../../../emails/WelcomeEmail"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify the caller is an admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, contact_name, contact_email, headcount, default_cake_type, default_delivery_notes } = body

    // 1. Create company record (using anon key, admin RLS allows insert)
    const company = await createCompany(supabase, {
      name,
      contact_name,
      contact_email,
      headcount: Number(headcount),
      default_cake_type: default_cake_type || "Vanilla Sponge",
      default_delivery_notes: default_delivery_notes || null,
      subscription_status: "inactive",
    })

    // 2. Create Supabase auth user (service role, bypasses RLS)
    // Create service role client inline
    const { createClient: createServiceClient } = await import("@supabase/supabase-js")
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Generate a temporary password (user will reset via magic link)
    const tempPassword = crypto.randomUUID()

    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email: contact_email,
      password: tempPassword,
      email_confirm: true,
      app_metadata: { role: "client" },
    })

    if (authError || !authData.user) {
      // Rollback company
      await supabase.from("companies").delete().eq("id", company.id)
      return NextResponse.json({ error: authError?.message ?? "Failed to create user" }, { status: 400 })
    }

    // 3. Link user to company in public.users table
    await serviceSupabase
      .from("users")
      .upsert({ id: authData.user.id, role: "client", company_id: company.id })

    // 4. Create Stripe customer + subscription
    let stripeCustomerId: string | null = null
    let stripeSubscriptionId: string | null = null
    try {
      stripeCustomerId = await createStripeCustomer({ name, email: contact_email })
      stripeSubscriptionId = await createStripeSubscription({
        customerId: stripeCustomerId,
        headcount: Number(headcount),
      })
      await updateCompany(supabase, company.id, {
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        subscription_status: "active",
      })
    } catch (stripeError) {
      // Non-fatal — log and continue without billing
      console.error("Stripe setup failed:", stripeError)
    }

    // 5. Generate magic link and send welcome email
    const { data: linkData } = await serviceSupabase.auth.admin.generateLink({
      type: "magiclink",
      email: contact_email,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const loginUrl = linkData?.properties?.action_link ?? `${appUrl}/login`

    const emailHtml = await render(
      WelcomeEmail({ contactName: contact_name ?? name, companyName: name, loginUrl, appUrl })
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to: contact_email,
      subject: "Welcome to CakeDay",
      html: emailHtml,
    })

    return NextResponse.json({ success: true, companyId: company.id })
  } catch (error) {
    console.error("Create client error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
