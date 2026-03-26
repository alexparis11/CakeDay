"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, SkipForward, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDeliveryDate, formatBirthday } from "@/lib/utils"
import type { OrderWithEmployee } from "@/types"
import { toast } from "@/hooks/useToast"
import { cn } from "@/lib/utils"

interface ClientOrdersTableProps {
  orders: OrderWithEmployee[]
  showActions?: boolean
}

export default function ClientOrdersTable({
  orders,
  showActions = true,
}: ClientOrdersTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<{ id: string; action: "approve" | "skip" } | null>(null)

  async function handleAction(orderId: string, action: "approve" | "skip") {
    setLoading({ id: orderId, action })
    try {
      const res = await fetch(`/api/orders/${orderId}/${action}`, { method: "POST" })
      if (!res.ok) throw new Error("Action failed")
      router.refresh()
      toast({
        title: action === "approve" ? "Order approved 🎂" : "Order skipped",
        description: action === "approve"
          ? "We'll notify the bakery team to prepare for delivery."
          : "This order has been skipped.",
      })
    } catch {
      toast({ title: "Error", description: `Failed to ${action} order.`, variant: "destructive" })
    } finally {
      setLoading(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="font-medium">No orders to show</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const employeeName = order.employees
          ? `${order.employees.first_name} ${order.employees.last_name}`
          : "—"
        const isPending = order.status === "pending_approval"
        const isSkipped = order.status === "skipped"
        const isApproving = loading?.id === order.id && loading.action === "approve"
        const isSkipping = loading?.id === order.id && loading.action === "skip"

        return (
          <div
            key={order.id}
            className={cn(
              "flex items-center justify-between gap-4 p-4 rounded-lg border transition-colors",
              isSkipped
                ? "border-zinc-200 bg-zinc-50 opacity-60"
                : "border-zinc-200 bg-white hover:bg-zinc-50/50"
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={cn("font-medium text-zinc-900 text-sm", isSkipped && "line-through text-zinc-400")}>
                  {employeeName}
                </p>
                <Badge variant={order.status as "pending" | "approved" | "skipped" | "dispatched"}>
                  {order.status === "pending_approval" ? "Pending" : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <p className="text-xs text-zinc-500">
                  📅 {formatDeliveryDate(order.delivery_date)}
                </p>
                <p className="text-xs text-zinc-500">
                  🎂 {order.cake_type}
                </p>
                <p className="text-xs text-zinc-500 truncate max-w-xs">
                  📍 {order.delivery_address}
                </p>
              </div>
            </div>

            {showActions && isPending && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="coral"
                  onClick={() => handleAction(order.id, "approve")}
                  disabled={loading !== null}
                >
                  {isApproving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(order.id, "skip")}
                  disabled={loading !== null}
                >
                  {isSkipping ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <SkipForward className="h-3 w-3" />
                  )}
                  Skip
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
