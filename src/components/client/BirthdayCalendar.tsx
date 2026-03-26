"use client"

import { addDays, format, isSameDay } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { nextBirthdayDate, formatBirthday } from "@/lib/utils"
import type { Employee, OrderWithEmployee } from "@/types"

interface BirthdayCalendarProps {
  employees: Employee[]
  orders: OrderWithEmployee[]
  days?: number
}

export default function BirthdayCalendar({
  employees,
  orders,
  days = 30,
}: BirthdayCalendarProps) {
  const today = new Date()

  // Build a map of delivery_date → order for quick lookup
  const ordersByDate = new Map<string, OrderWithEmployee>()
  orders.forEach((order) => {
    ordersByDate.set(order.delivery_date, order)
  })

  // Find employees with birthdays in the next `days` days
  const upcoming = employees
    .map((emp) => ({
      employee: emp,
      birthdayDate: nextBirthdayDate(emp.birthday),
    }))
    .filter(({ birthdayDate }) => {
      const cutoff = addDays(today, days)
      return birthdayDate >= today && birthdayDate <= cutoff
    })
    .sort((a, b) => a.birthdayDate.getTime() - b.birthdayDate.getTime())

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <p className="font-medium">No birthdays in the next {days} days 🎂</p>
        <p className="text-sm mt-1">Add employees to start tracking birthdays.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {upcoming.map(({ employee, birthdayDate }) => {
        const dateKey = format(birthdayDate, "yyyy-MM-dd")
        const order = ordersByDate.get(dateKey)
        const daysUntil = Math.ceil(
          (birthdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        return (
          <div
            key={employee.id}
            className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Day badge */}
              <div className="w-12 text-center flex-shrink-0">
                <div className="text-xs text-zinc-400 font-medium uppercase">
                  {format(birthdayDate, "MMM")}
                </div>
                <div className="text-xl font-bold text-zinc-900 leading-tight">
                  {format(birthdayDate, "d")}
                </div>
              </div>

              {/* Employee info */}
              <div>
                <p className="font-medium text-zinc-900 text-sm">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-xs text-zinc-500">
                  {daysUntil === 0
                    ? "🎂 Today!"
                    : daysUntil === 1
                    ? "Tomorrow"
                    : `In ${daysUntil} days`}
                </p>
              </div>
            </div>

            {/* Order status badge */}
            <div className="flex-shrink-0">
              {order ? (
                <Badge
                  variant={order.status as "pending" | "approved" | "skipped" | "dispatched"}
                >
                  {order.status === "pending_approval"
                    ? "Pending"
                    : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-zinc-400">
                  No order
                </Badge>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
