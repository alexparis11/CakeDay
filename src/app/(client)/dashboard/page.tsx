import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listEmployees } from "@/lib/services/employees"
import { listUpcomingOrders } from "@/lib/services/orders"
import { Card, CardContent } from "@/components/ui/card"
import BirthdayCalendar from "@/components/client/BirthdayCalendar"
import { isBirthdayWithinDays, pluralise } from "@/lib/utils"
import { CalendarDays, Clock, CheckCircle, Cake } from "lucide-react"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get company
  const { data: userData } = await supabase
    .from("users")
    .select("company_id, companies(name)")
    .eq("id", user.id)
    .single()

  const companyId = userData?.company_id
  if (!companyId) {
    return (
      <div className="p-6">
        <p className="text-zinc-500">Your account is not linked to a company yet. Contact your administrator.</p>
      </div>
    )
  }

  // @ts-expect-error joined type
  const companyName = userData?.companies?.name ?? "Your Company"

  const [employees, upcomingOrders] = await Promise.all([
    listEmployees(supabase, companyId),
    listUpcomingOrders(supabase, companyId, 30),
  ])

  const birthdaysThisMonth = employees.filter((e) => isBirthdayWithinDays(e.birthday, 30)).length
  const pendingOrders = upcomingOrders.filter((o) => o.status === "pending_approval").length
  const approvedOrders = upcomingOrders.filter((o) => o.status === "approved").length

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Welcome back 👋
        </h1>
        <p className="text-zinc-500 mt-1">{companyName} · {format(new Date(), "EEEE, d MMMM yyyy")}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-[#FF6B4A]/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-[#FF6B4A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{birthdaysThisMonth}</p>
              <p className="text-sm text-zinc-500">Upcoming birthdays</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{pendingOrders}</p>
              <p className="text-sm text-zinc-500">Awaiting approval</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{approvedOrders}</p>
              <p className="text-sm text-zinc-500">Orders approved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Birthday calendar */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Cake className="h-5 w-5 text-[#FF6B4A]" />
          <h2 className="text-base font-semibold text-zinc-900">Upcoming birthdays — next 30 days</h2>
        </div>
        <BirthdayCalendar
          employees={employees}
          orders={upcomingOrders}
          days={30}
        />
      </div>
    </div>
  )
}
