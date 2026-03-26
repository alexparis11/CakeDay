import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import type { Order, OrderInsert, OrderUpdate, OrderWithEmployee, OrderWithCompany } from "@/types"
import { format, addDays } from "date-fns"

type DBClient = SupabaseClient<Database>

export async function listUpcomingOrders(
  supabase: DBClient,
  companyId: string,
  days = 30
): Promise<OrderWithEmployee[]> {
  const today = format(new Date(), "yyyy-MM-dd")
  const future = format(addDays(new Date(), days), "yyyy-MM-dd")

  const { data, error } = await supabase
    .from("orders")
    .select("*, employees(first_name, last_name, birthday)")
    .eq("company_id", companyId)
    .gte("delivery_date", today)
    .lte("delivery_date", future)
    .order("delivery_date", { ascending: true })

  if (error) throw error
  return (data ?? []) as OrderWithEmployee[]
}

export async function listAllUpcomingOrders(
  supabase: DBClient,
  days = 30
): Promise<OrderWithCompany[]> {
  const today = format(new Date(), "yyyy-MM-dd")
  const future = format(addDays(new Date(), days), "yyyy-MM-dd")

  const { data, error } = await supabase
    .from("orders")
    .select("*, companies(name), employees(first_name, last_name)")
    .gte("delivery_date", today)
    .lte("delivery_date", future)
    .order("delivery_date", { ascending: true })

  if (error) throw error
  return (data ?? []) as OrderWithCompany[]
}

export async function listPastOrders(
  supabase: DBClient,
  companyId: string
): Promise<OrderWithEmployee[]> {
  const today = format(new Date(), "yyyy-MM-dd")

  const { data, error } = await supabase
    .from("orders")
    .select("*, employees(first_name, last_name, birthday)")
    .eq("company_id", companyId)
    .lt("delivery_date", today)
    .order("delivery_date", { ascending: false })
    .limit(100)

  if (error) throw error
  return (data ?? []) as OrderWithEmployee[]
}

export async function getOrder(
  supabase: DBClient,
  id: string
): Promise<OrderWithEmployee | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, employees(first_name, last_name, birthday)")
    .eq("id", id)
    .single()

  if (error) throw error
  return data as OrderWithEmployee
}

export async function createOrder(
  supabase: DBClient,
  data: OrderInsert
): Promise<Order> {
  const { data: order, error } = await supabase
    .from("orders")
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return order
}

export async function approveOrder(
  supabase: DBClient,
  id: string
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function skipOrder(
  supabase: DBClient,
  id: string
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "skipped" })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function dispatchOrder(
  supabase: DBClient,
  id: string
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "dispatched", dispatched_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAdminDashboardStats(supabase: DBClient) {
  const today = format(new Date(), "yyyy-MM-dd")
  const thirtyDays = format(addDays(new Date(), 30), "yyyy-MM-dd")
  const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd")
  const endOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd")

  const [activeClients, pendingOrders, approvedThisMonth] = await Promise.all([
    supabase
      .from("companies")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_approval")
      .gte("delivery_date", today),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("delivery_date", startOfMonth)
      .lte("delivery_date", endOfMonth),
  ])

  return {
    activeClients: activeClients.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    approvedThisMonth: approvedThisMonth.count ?? 0,
  }
}

// Check if an order already exists for this employee on a specific delivery date
export async function orderExistsForDate(
  supabase: DBClient,
  employeeId: string,
  deliveryDate: string
): Promise<boolean> {
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("delivery_date", deliveryDate)

  return (count ?? 0) > 0
}
