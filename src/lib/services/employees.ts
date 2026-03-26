import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import type { Employee, EmployeeInsert, EmployeeUpdate, CsvEmployeeRow } from "@/types"
import { isValidBirthday } from "@/lib/utils"

type DBClient = SupabaseClient<Database>

export async function listEmployees(
  supabase: DBClient,
  companyId: string
): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", companyId)
    .order("last_name", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getEmployee(
  supabase: DBClient,
  id: string
): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createEmployee(
  supabase: DBClient,
  data: EmployeeInsert
): Promise<Employee> {
  const { data: employee, error } = await supabase
    .from("employees")
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return employee
}

export async function updateEmployee(
  supabase: DBClient,
  id: string,
  data: EmployeeUpdate
): Promise<Employee> {
  const { data: employee, error } = await supabase
    .from("employees")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return employee
}

export async function deleteEmployee(
  supabase: DBClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("employees").delete().eq("id", id)
  if (error) throw error
}

export async function bulkInsertEmployees(
  supabase: DBClient,
  companyId: string,
  rows: CsvEmployeeRow[]
): Promise<{ inserted: number; errors: string[] }> {
  const toInsert: EmployeeInsert[] = rows.map((row) => ({
    company_id: companyId,
    first_name: row.first_name.trim(),
    last_name: row.last_name.trim(),
    birthday: row.birthday.trim(),
    delivery_address: row.delivery_address.trim(),
  }))

  const { data, error } = await supabase
    .from("employees")
    .insert(toInsert)
    .select()

  if (error) throw error
  return { inserted: data?.length ?? 0, errors: [] }
}

// ============================================================
// CSV parsing (runs on the server after file upload)
// ============================================================
export function parseCsvRows(rawText: string): {
  rows: CsvEmployeeRow[]
  errors: string[]
} {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return { rows: [], errors: ["CSV file is empty"] }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const required = ["first_name", "last_name", "birthday", "delivery_address"]
  const missing = required.filter((r) => !headers.includes(r))

  if (missing.length > 0) {
    return {
      rows: [],
      errors: [`Missing required columns: ${missing.join(", ")}`],
    }
  }

  const rows: CsvEmployeeRow[] = []
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] ?? "" })

    const csvRow: CsvEmployeeRow = {
      first_name: row.first_name ?? "",
      last_name: row.last_name ?? "",
      birthday: row.birthday ?? "",
      delivery_address: row.delivery_address ?? "",
      _rowIndex: i,
    }

    if (!csvRow.first_name) csvRow._error = "Missing first_name"
    else if (!csvRow.last_name) csvRow._error = "Missing last_name"
    else if (!isValidBirthday(csvRow.birthday))
      csvRow._error = `Invalid birthday "${csvRow.birthday}" — use MM-DD format`
    else if (!csvRow.delivery_address) csvRow._error = "Missing delivery_address"

    rows.push(csvRow)
    if (csvRow._error) errors.push(`Row ${i}: ${csvRow._error}`)
  }

  return { rows, errors }
}
