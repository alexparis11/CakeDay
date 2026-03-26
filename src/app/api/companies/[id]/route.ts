import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateCompany } from "@/lib/services/companies"

interface Props { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const company = await updateCompany(supabase, id, body)
    return NextResponse.json({ company })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
  }
}
