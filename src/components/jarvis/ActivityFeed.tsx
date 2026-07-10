import type { ActivityEvent } from "@/lib/jarvis/types"
import { getAgent, getBusiness } from "@/lib/jarvis/data"
import { ACTIVITY_META, timeAgo } from "@/lib/jarvis/ui"

interface ActivityFeedProps {
  events: ActivityEvent[]
  showBusiness: boolean
}

export default function ActivityFeed({ events, showBusiness }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-200 py-10 text-center text-sm text-zinc-400">
        No activity yet
      </div>
    )
  }

  return (
    <ol className="relative">
      {events.map((event, i) => {
        const agent = getAgent(event.agentId)
        const business = getBusiness(event.businessId)
        const meta = ACTIVITY_META[event.type]
        const last = i === events.length - 1

        return (
          <li key={event.id} className="relative flex gap-3 pb-4">
            {/* rail */}
            {!last && (
              <span className="absolute left-[5px] top-3 bottom-0 w-px bg-zinc-200" aria-hidden="true" />
            )}
            <span className={`mt-1 h-[11px] w-[11px] rounded-full ring-4 ring-white flex-shrink-0 ${meta.dot}`} />

            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-700 leading-snug">{event.message}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
                <span className="font-medium text-zinc-500">{agent?.name ?? "Agent"}</span>
                {showBusiness && business && (
                  <>
                    <span>•</span>
                    <span>{business.emoji} {business.name}</span>
                  </>
                )}
                <span>•</span>
                <span>{timeAgo(event.at)}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
