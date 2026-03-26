import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminShell from "@/components/layouts/AdminShell"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const role = user.app_metadata?.role as string | undefined
  if (role !== "admin") redirect("/dashboard")

  return (
    <AdminShell userEmail={user.email ?? ""}>
      {children}
    </AdminShell>
  )
}
