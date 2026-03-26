import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getCompany } from "@/lib/services/companies"
import SettingsForm from "@/components/client/SettingsForm"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
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

  const company = await getCompany(supabase, companyId)
  if (!company) redirect("/dashboard")

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your delivery preferences and billing</p>
      </div>

      <SettingsForm company={company} />
    </div>
  )
}
