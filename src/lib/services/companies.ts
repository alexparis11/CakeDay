import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import type { Company, CompanyInsert, CompanyUpdate, CompanyWithOrderCount } from "@/types"

type DBClient = SupabaseClient<Database>

export async function getCompany(
  supabase: DBClient,
  id: string
): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function getCompanyByStripeCustomer(
  supabase: DBClient,
  stripeCustomerId: string
): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function listCompanies(
  supabase: DBClient
): Promise<CompanyWithOrderCount[]> {
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  // Get upcoming order counts per company
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const companiesWithCounts: CompanyWithOrderCount[] = await Promise.all(
    (companies ?? []).map(async (company) => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company.id)
        .gte("delivery_date", new Date().toISOString().split("T")[0])
        .lte("delivery_date", thirtyDaysFromNow.toISOString().split("T")[0])

      return { ...company, upcoming_orders_count: count ?? 0 }
    })
  )

  return companiesWithCounts
}

export async function createCompany(
  supabase: DBClient,
  data: CompanyInsert
): Promise<Company> {
  const { data: company, error } = await supabase
    .from("companies")
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return company
}

export async function updateCompany(
  supabase: DBClient,
  id: string,
  data: CompanyUpdate
): Promise<Company> {
  const { data: company, error } = await supabase
    .from("companies")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return company
}

export async function updateCompanySubscriptionStatus(
  supabase: DBClient,
  stripeSubscriptionId: string,
  status: "active" | "inactive"
): Promise<void> {
  const { error } = await supabase
    .from("companies")
    .update({ subscription_status: status })
    .eq("stripe_subscription_id", stripeSubscriptionId)

  if (error) throw error
}
