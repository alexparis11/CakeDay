import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCompany, updateCompany } from "@/lib/services/companies"
import { listEmployees } from "@/lib/services/employees"
import { listUpcomingOrders, listPastOrders, dispatchOrder } from "@/lib/services/orders"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminOrdersTable from "@/components/admin/OrdersTable"
import { formatBirthday, formatDeliveryDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminClientDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [company, employees, upcomingOrders, pastOrders] = await Promise.all([
    getCompany(supabase, id),
    listEmployees(supabase, id),
    listUpcomingOrders(supabase, id, 30),
    listPastOrders(supabase, id),
  ])

  if (!company) notFound()

  async function handleUpdateCompany(formData: FormData) {
    "use server"
    const supabase = await createClient()
    await updateCompany(supabase, id, {
      name: String(formData.get("name")),
      contact_name: String(formData.get("contact_name")),
      contact_email: String(formData.get("contact_email")),
      headcount: Number(formData.get("headcount")),
      default_cake_type: String(formData.get("default_cake_type")),
      default_delivery_notes: String(formData.get("default_delivery_notes") ?? ""),
    })
    revalidatePath(`/admin/clients/${id}`)
  }

  async function handleDispatch(orderId: string) {
    "use server"
    const supabase = await createClient()
    await dispatchOrder(supabase, orderId)
    revalidatePath(`/admin/clients/${id}`)
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{company.name}</h1>
          <p className="text-zinc-500 mt-1">{company.contact_email}</p>
        </div>
        <Badge variant={company.subscription_status as "active" | "inactive"} className="text-sm">
          {company.subscription_status === "active" ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Company details</TabsTrigger>
          <TabsTrigger value="employees">
            Employees ({employees.length})
          </TabsTrigger>
          <TabsTrigger value="orders">
            Orders ({upcomingOrders.length + pastOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* Company details tab */}
        <TabsContent value="details" className="mt-4">
          <form action={handleUpdateCompany} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="name">Company name</Label>
              <Input id="name" name="name" defaultValue={company.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_name">Contact name</Label>
              <Input id="contact_name" name="contact_name" defaultValue={company.contact_name ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_email">Contact email</Label>
              <Input id="contact_email" name="contact_email" type="email" defaultValue={company.contact_email} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="headcount">Headcount</Label>
              <Input id="headcount" name="headcount" type="number" defaultValue={company.headcount} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="default_cake_type">Default cake type</Label>
              <Input id="default_cake_type" name="default_cake_type" defaultValue={company.default_cake_type} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="default_delivery_notes">Default delivery notes</Label>
              <Textarea id="default_delivery_notes" name="default_delivery_notes" defaultValue={company.default_delivery_notes ?? ""} rows={3} />
            </div>
            <Button type="submit" variant="coral">Save changes</Button>
          </form>
        </TabsContent>

        {/* Employees tab */}
        <TabsContent value="employees" className="mt-4">
          {employees.length === 0 ? (
            <p className="text-zinc-500 py-8 text-center">No employees added yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="text-left px-4 py-3 font-medium text-zinc-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-500">Birthday</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-500">Delivery address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-zinc-50/50">
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {emp.first_name} {emp.last_name}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{formatBirthday(emp.birthday)}</td>
                      <td className="px-4 py-3 text-zinc-600">{emp.delivery_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Orders tab */}
        <TabsContent value="orders" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-700 mb-2">Upcoming (30 days)</h3>
            <AdminOrdersTable
              orders={upcomingOrders.map((o) => ({
                ...o,
                companies: { name: company.name },
              }))}
              onDispatch={handleDispatch}
            />
          </div>
          {pastOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 mb-2 mt-6">History</h3>
              <div className="overflow-x-auto rounded-lg border border-zinc-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="text-left px-4 py-3 font-medium text-zinc-500">Employee</th>
                      <th className="text-left px-4 py-3 font-medium text-zinc-500">Delivery date</th>
                      <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {pastOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-medium">
                          {order.employees ? `${order.employees.first_name} ${order.employees.last_name}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{formatDeliveryDate(order.delivery_date)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={order.status as "pending" | "approved" | "skipped" | "dispatched"}>
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
