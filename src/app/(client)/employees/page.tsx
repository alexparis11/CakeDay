import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listEmployees } from "@/lib/services/employees"
import EmployeesTable from "@/components/client/EmployeesTable"
import CsvUpload from "@/components/client/CsvUpload"
import AddEmployeeModal from "@/components/client/AddEmployeeModal"
import { Upload } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EmployeesPage() {
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

  const employees = await listEmployees(supabase, companyId)

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Employees</h1>
          <p className="text-zinc-500 mt-1">{employees.length} {employees.length === 1 ? "employee" : "employees"} registered</p>
        </div>
        <div className="flex items-center gap-2">
          <AddEmployeeModal companyId={companyId} />
        </div>
      </div>

      {/* CSV Upload */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload CSV
        </h2>
        <CsvUpload companyId={companyId} />
      </div>

      {/* Table */}
      <EmployeesTable employees={employees} companyId={companyId} />
    </div>
  )
}
