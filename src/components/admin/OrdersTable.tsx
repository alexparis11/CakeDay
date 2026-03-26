"use client"

import { useState, useTransition } from "react"
import { Loader2, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDeliveryDate } from "@/lib/utils"
import type { OrderWithCompany } from "@/types"
import { toast } from "@/hooks/useToast"

interface AdminOrdersTableProps {
  orders: OrderWithCompany[]
  onDispatch?: (orderId: string) => Promise<void>
}

const STATUS_LABELS: Record<string, string> = {
  pending_approval: "Pending",
  approved: "Approved",
  skipped: "Skipped",
  dispatched: "Dispatched",
}

type StatusVariant = "pending" | "approved" | "skipped" | "dispatched"

export default function AdminOrdersTable({ orders, onDispatch }: AdminOrdersTableProps) {
  const [dispatching, setDispatching] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function handleDispatch(orderId: string) {
    if (!onDispatch) return
    setDispatching(orderId)
    try {
      await onDispatch(orderId)
      toast({ title: "Order dispatched", description: "Order status updated to dispatched." })
    } catch {
      toast({ title: "Error", description: "Failed to dispatch order.", variant: "destructive" })
    } finally {
      setDispatching(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <Truck className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No orders in the next 30 days</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200">
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Employee</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Company</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Delivery date</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
            <th className="text-right px-4 py-3 font-medium text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {orders.map((order) => {
            const employeeName = order.employees
              ? `${order.employees.first_name} ${order.employees.last_name}`
              : "—"
            const companyName = order.companies?.name ?? "—"

            return (
              <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-900">{employeeName}</td>
                <td className="px-4 py-3 text-zinc-600">{companyName}</td>
                <td className="px-4 py-3 text-zinc-600">{formatDeliveryDate(order.delivery_date)}</td>
                <td className="px-4 py-3">
                  <Badge variant={order.status as StatusVariant}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {order.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDispatch(order.id)}
                      disabled={dispatching === order.id}
                    >
                      {dispatching === order.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Truck className="h-3 w-3" />
                      )}
                      Mark dispatched
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
