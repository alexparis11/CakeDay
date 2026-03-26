import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { approveOrder, getOrder } from "@/lib/services/orders"
import { getCompany } from "@/lib/services/companies"
import resend, { FROM_EMAIL } from "@/lib/resend"
import { render } from "@react-email/render"
import AdminOrderAlert from "../../../../../../emails/AdminOrderAlert"
import { format } from "date-fns"

interface Props { params: Promise<{ id: string }> }

export async function POST(_: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const order = await approveOrder(supabase, id)

    // Fetch full order details for admin alert email
    const fullOrder = await getOrder(supabase, id)
    const company = await getCompany(supabase, order.company_id)

    if (fullOrder && company) {
      const employeeName = fullOrder.employees
        ? `${fullOrder.employees.first_name} ${fullOrder.employees.last_name}`
        : "Unknown"

      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail) {
        const html = await render(
          AdminOrderAlert({
            employeeName,
            companyName: company.name,
            deliveryDate: format(new Date(order.delivery_date), "EEEE, d MMMM yyyy"),
            cakeType: order.cake_type,
            deliveryAddress: order.delivery_address,
            approvedAt: format(new Date(), "d MMMM yyyy 'at' HH:mm"),
            orderId: order.id.slice(0, 8).toUpperCase(),
          })
        )

        await resend.emails.send({
          from: FROM_EMAIL,
          to: adminEmail,
          subject: `New order approved: ${employeeName} at ${company.name}`,
          html,
        })
      }

      // Log to bakery_summary_emails
      await supabase.from("bakery_summary_emails").insert({ order_id: id })
    }

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: "Failed to approve order" }, { status: 500 })
  }
}
