import { PoundSterling, Bot, BellRing, Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { JarvisStats } from "@/lib/jarvis/data"

interface StatTilesProps {
  stats: JarvisStats
}

export default function StatTiles({ stats }: StatTilesProps) {
  const up = stats.mrrChangePct >= 0
  const TrendIcon = up ? TrendingUp : TrendingDown

  const tiles = [
    {
      label: "Portfolio revenue / mo",
      value: `${stats.currency}${stats.totalMrr.toLocaleString()}`,
      icon: PoundSterling,
      iconBg: "bg-[#FF6B4A]/10",
      iconColor: "text-[#FF6B4A]",
      foot: (
        <span className={`inline-flex items-center gap-1 ${up ? "text-green-600" : "text-red-600"}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {up ? "+" : ""}{stats.mrrChangePct.toFixed(1)}% vs last month
        </span>
      ),
    },
    {
      label: "Agents working now",
      value: `${stats.activeAgents} / ${stats.totalAgents}`,
      icon: Bot,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      foot: <span className="text-zinc-500">of your agent roster active</span>,
    },
    {
      label: "Waiting on you",
      value: String(stats.needsApproval),
      icon: BellRing,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      foot: <span className="text-zinc-500">approvals in the queue</span>,
    },
    {
      label: "In progress",
      value: String(stats.tasksInProgress),
      icon: Loader2,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      foot: <span className="text-zinc-500">tasks running right now</span>,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {tiles.map(({ label, value, icon: Icon, iconBg, iconColor, foot }) => (
        <Card key={label} className="border-zinc-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <p className="text-sm text-zinc-500">{label}</p>
            </div>
            <p className="text-3xl font-bold text-zinc-900 mt-3">{value}</p>
            <p className="text-xs mt-1.5">{foot}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
