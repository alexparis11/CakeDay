import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listUpcomingOrders, listPastOrders } from "@/lib/services/orders"
import ClientOrdersTable from "@/components/client/OrdersTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single()

  const companyId = userData?.company_id
  if (!companyId) redirect("/dashboard")

  const [upcomingOrders, pastOrders] = await Promise.all([
    listUpcomingOrders(supabase, companyId, 30),
    listPastOrders(supabase, companyId),
  ])

  const pendingOrders = upcomingOrders.filter((o) => o.status === "pending_approval")
  const approvedOrders = upcomingOrders.filter((o) => o.status === "approved")
  const skippedOrders = upcomingOrders.filter((o) => o.status === "skipped")

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>
        <p className="text-zinc-500 mt-1">Upcoming cake orders for the next 30 days</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingOrders.length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedOrders.length})</TabsTrigger>
          <TabsTrigger value="skipped">Skipped ({skippedOrders.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="font-medium">No orders pending approval 🎉</p>
              <p className="text-sm mt-1">All upcoming orders have been reviewed.</p>
            </div>
          ) : (
            <ClientOrdersTable orders={pendingOrders} showActions />
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <ClientOrdersTable orders={approvedOrders} showActions={false} />
        </TabsContent>

        <TabsContent value="skipped" className="mt-4">
          <ClientOrdersTable orders={skippedOrders} showActions={false} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {pastOrders.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="font-medium">No past orders yet</p>
            </div>
          ) : (
            <ClientOrdersTable orders={pastOrders} showActions={false} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
