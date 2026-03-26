import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { skipOrder } from "@/lib/services/orders"

interface Props { params: Promise<{ id: string }> }

export async function POST(_: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const order = await skipOrder(supabase, id)
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: "Failed to skip order" }, { status: 500 })
  }
}
