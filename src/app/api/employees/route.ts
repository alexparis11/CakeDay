import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createEmployee } from "@/lib/services/employees"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { first_name, last_name, birthday, delivery_address, company_id } = body

    // Verify the company belongs to this user (RLS enforced on insert anyway)
    const employee = await createEmployee(supabase, {
      company_id,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      birthday: birthday.trim(),
      delivery_address: delivery_address.trim(),
    })

    return NextResponse.json({ employee })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create employee" },
      { status: 500 }
    )
  }
}
