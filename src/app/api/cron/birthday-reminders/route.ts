import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { createOrder, orderExistsForDate } from "@/lib/services/orders"
import resend, { FROM_EMAIL } from "@/lib/resend"
import { render } from "@react-email/render"
import BirthdayReminder from "../../../../../emails/BirthdayReminder"
import { format, addDays } from "date-fns"

export async function GET(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const targetDate = addDays(new Date(), 7)
  const targetMMDD = format(targetDate, "MM-dd")
  const targetDateStr = format(targetDate, "yyyy-MM-dd")

  // Find employees with birthday exactly 7 days from today
  // Use MM-DD comparison — handles year boundary
  const { data: employees, error } = await supabase
    .from("employees")
    .select("*, companies(id, name, contact_email, default_cake_type, default_delivery_notes)")
    .eq("birthday", targetMMDD)

  if (error) {
    console.error("Birthday reminders query failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = { created: 0, skipped: 0, emailsSent: 0, errors: [] as string[] }

  for (const employee of employees ?? []) {
    // @ts-expect-error joined type
    const company = employee.companies
    if (!company) continue

    try {
      // Check if an order already exists for this employee on the delivery date
      const exists = await orderExistsForDate(supabase, employee.id, targetDateStr)
      if (exists) {
        results.skipped++
        continue
      }

      // Create pending_approval order
      const order = await createOrder(supabase, {
        company_id: employee.company_id,
        employee_id: employee.id,
        delivery_date: targetDateStr,
        cake_type: company.default_cake_type ?? "Vanilla Sponge",
        delivery_address: employee.delivery_address,
        status: "pending_approval",
      })
      results.created++

      // Send reminder email to the HR manager
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      const html = await render(
        BirthdayReminder({
          employeeName: `${employee.first_name} ${employee.last_name}`,
          deliveryDate: format(targetDate, "EEEE, d MMMM yyyy"),
          cakeType: company.default_cake_type ?? "Vanilla Sponge",
          deliveryAddress: employee.delivery_address,
          orderId: order.id,
          appUrl,
        })
      )

      await resend.emails.send({
        from: FROM_EMAIL,
        to: company.contact_email,
        subject: `🎂 ${employee.first_name} ${employee.last_name}'s birthday is in 7 days`,
        html,
      })
      results.emailsSent++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.errors.push(`Employee ${employee.id}: ${msg}`)
    }
  }

  return NextResponse.json({
    message: "Birthday reminders processed",
    targetDate: targetDateStr,
    ...results,
  })
}
