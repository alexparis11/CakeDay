import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ClientShell from "@/components/layouts/ClientShell"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const role = user.app_metadata?.role as string | undefined
  if (role === "admin") redirect("/admin/dashboard")

  // Fetch company name for the sidebar
  const { data: userData } = await supabase
    .from("users")
    .select("company_id, companies(name)")
    .eq("id", user.id)
    .single()

  // @ts-expect-error joined type
  const companyName = userData?.companies?.name ?? "Your Company"

  return (
    <ClientShell userEmail={user.email ?? ""} companyName={companyName}>
      {children}
    </ClientShell>
  )
}
