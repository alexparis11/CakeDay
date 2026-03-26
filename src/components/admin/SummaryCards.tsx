import { Users, Clock, CheckCircle, PoundSterling } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SummaryCardsProps {
  activeClients: number
  pendingOrders: number
  approvedThisMonth: number
  estimatedRevenue: string
}

const cards = [
  {
    key: "activeClients" as const,
    label: "Active clients",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    key: "pendingOrders" as const,
    label: "Pending approval",
    icon: Clock,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    key: "approvedThisMonth" as const,
    label: "Approved this month",
    icon: CheckCircle,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    key: "estimatedRevenue" as const,
    label: "Est. monthly revenue",
    icon: PoundSterling,
    iconBg: "bg-[#FF6B4A]/10",
    iconColor: "text-[#FF6B4A]",
  },
]

export default function SummaryCards({
  activeClients,
  pendingOrders,
  approvedThisMonth,
  estimatedRevenue,
}: SummaryCardsProps) {
  const values = { activeClients, pendingOrders, approvedThisMonth, estimatedRevenue }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, iconBg, iconColor }) => (
        <Card key={key} className="border-zinc-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`h-11 w-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{values[key]}</p>
              <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
