import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import resend, { FROM_EMAIL } from "@/lib/resend"
import { render } from "@react-email/render"
import BirthdayNudge from "../../../../../emails/BirthdayNudge"
import { format, differenceInDays, subDays } from "date-fns"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Find orders that are still pending_approval and were created 5+ days ago
  const fiveDaysAgo = subDays(new Date(), 5)

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, employees(first_name, last_name, delivery_address), companies(contact_email, default_cake_type)")
    .eq("status", "pending_approval")
    .lte("created_at", fiveDaysAgo.toISOString())
    .gte("delivery_date", format(new Date(), "yyyy-MM-dd")) // Only upcoming orders

  if (error) {
    console.error("Birthday nudges query failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = { nudgesSent: 0, errors: [] as string[] }

  for (const order of orders ?? []) {
    // @ts-expect-error joined type
    const employee = order.employees
    // @ts-expect-error joined type
    const company = order.companies
    if (!employee || !company) continue

    try {
      const deliveryDate = new Date(order.delivery_date)
      const daysUntilDelivery = differenceInDays(deliveryDate, new Date())
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

      const html = await render(
        BirthdayNudge({
          employeeName: `${employee.first_name} ${employee.last_name}`,
          deliveryDate: format(deliveryDate, "EEEE, d MMMM yyyy"),
          cakeType: company.default_cake_type ?? order.cake_type,
          deliveryAddress: employee.delivery_address,
          daysUntilDelivery,
          appUrl,
        })
      )

      await resend.emails.send({
        from: FROM_EMAIL,
        to: company.contact_email,
        subject: `Reminder: approve ${employee.first_name} ${employee.last_name}'s birthday cake`,
        html,
      })
      results.nudgesSent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.errors.push(`Order ${order.id}: ${msg}`)
    }
  }

  return NextResponse.json({
    message: "Birthday nudges processed",
    ...results,
  })
}
