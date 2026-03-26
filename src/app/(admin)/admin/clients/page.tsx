import { createClient } from "@/lib/supabase/server"
import { listCompanies } from "@/lib/services/companies"
import ClientsTable from "@/components/admin/ClientsTable"
import AddClientModal from "@/components/admin/AddClientModal"

export const dynamic = "force-dynamic"

export default async function AdminClientsPage() {
  const supabase = await createClient()
  const companies = await listCompanies(supabase)

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Clients</h1>
          <p className="text-zinc-500 mt-1">{companies.length} {companies.length === 1 ? "company" : "companies"} registered</p>
        </div>
        <AddClientModal />
      </div>

      <ClientsTable companies={companies} />
    </div>
  )
}
