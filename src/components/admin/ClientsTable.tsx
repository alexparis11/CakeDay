import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CompanyWithOrderCount } from "@/types"

interface ClientsTableProps {
  companies: CompanyWithOrderCount[]
}

export default function ClientsTable({ companies }: ClientsTableProps) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="font-medium">No clients yet</p>
        <p className="text-sm mt-1">Add your first client using the button above.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200">
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Company</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Contact</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Headcount</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Subscription</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Upcoming orders</th>
            <th className="text-right px-4 py-3 font-medium text-zinc-500" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-zinc-50/50 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-zinc-900">{company.name}</p>
              </td>
              <td className="px-4 py-3 text-zinc-600">
                <p>{company.contact_name}</p>
                <p className="text-xs text-zinc-400">{company.contact_email}</p>
              </td>
              <td className="px-4 py-3 text-zinc-600">{company.headcount}</td>
              <td className="px-4 py-3">
                <Badge variant={company.subscription_status as "active" | "inactive"}>
                  {company.subscription_status === "active" ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-zinc-600">
                {company.upcoming_orders_count ?? 0}
              </td>
              <td className="px-4 py-3 text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/clients/${company.id}`}>
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
