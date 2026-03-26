import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { bulkInsertEmployees } from "@/lib/services/employees"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { companyId, rows } = await request.json()
    if (!companyId || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const result = await bulkInsertEmployees(supabase, companyId, rows)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Bulk insert failed" }, { status: 500 })
  }
}
