import { Plug, CircleDot } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Agent } from "@/lib/jarvis/types"
import { AGENT_STATUS_META, DOMAIN_ICON, timeAgo } from "@/lib/jarvis/ui"

interface AgentRosterProps {
  agents: Agent[]
}

export default function AgentRoster({ agents }: AgentRosterProps) {
  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  const Icon = DOMAIN_ICON[agent.domain]
  const status = AGENT_STATUS_META[agent.status]

  return (
    <Card className="border-zinc-200 p-4 flex gap-3.5 items-start hover:border-zinc-300 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-white" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-zinc-900">{agent.name}</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${status.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <p className="text-sm text-zinc-500 mt-1 leading-snug">{agent.role}</p>

        <div className="mt-2.5 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Plug className="h-3.5 w-3.5" />
            {agent.integration.label}
            {agent.integration.connected ? (
              <span className="text-green-600 font-medium">connected</span>
            ) : (
              <span className="text-zinc-400">not connected</span>
            )}
          </span>
          <span className="text-zinc-300">•</span>
          <span>{timeAgo(agent.lastActiveAt)}</span>
        </div>

        {agent.currentTask && (
          <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-zinc-50 border border-zinc-100 px-2.5 py-1.5 text-xs text-zinc-600">
            <CircleDot className="h-3.5 w-3.5 mt-px flex-shrink-0 text-zinc-400" />
            <span>{agent.currentTask}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
