import { createClient } from "@/lib/supabase/server"
import { getAdminDashboardStats, listAllUpcomingOrders, dispatchOrder } from "@/lib/services/orders"
import { listCompanies } from "@/lib/services/companies"
import SummaryCards from "@/components/admin/SummaryCards"
import AdminOrdersTable from "@/components/admin/OrdersTable"
import { revalidatePath } from "next/cache"
import { PLANS } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [stats, upcomingOrders, companies] = await Promise.all([
    getAdminDashboardStats(supabase),
    listAllUpcomingOrders(supabase, 30),
    listCompanies(supabase),
  ])

  // Estimate monthly revenue
  const activeCompanies = companies.filter((c) => c.subscription_status === "active")
  const estimatedRevenuePence = activeCompanies.reduce((sum, company) => {
    const plan = company.headcount <= PLANS.starter.maxEmployees ? "starter" : "growth"
    return sum + PLANS[plan].monthlyPricePence
  }, 0)
  const estimatedRevenue = `£${(estimatedRevenuePence / 100).toFixed(0)}`

  async function handleDispatch(orderId: string) {
    "use server"
    const supabase = await createClient()
    await dispatchOrder(supabase, orderId)
    revalidatePath("/admin/dashboard")
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Overview of all clients and upcoming orders</p>
      </div>

      <SummaryCards
        activeClients={stats.activeClients}
        pendingOrders={stats.pendingOrders}
        approvedThisMonth={stats.approvedThisMonth}
        estimatedRevenue={estimatedRevenue}
      />

      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">
          Orders — next 30 days
          <span className="ml-2 text-sm font-normal text-zinc-500">
            ({upcomingOrders.length} total)
          </span>
        </h2>
        <AdminOrdersTable
          orders={upcomingOrders}
          onDispatch={handleDispatch}
        />
      </div>
    </div>
  )
}
