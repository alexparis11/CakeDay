import type { AgentTask } from "@/lib/jarvis/types"
import { getAgent, getBusiness } from "@/lib/jarvis/data"
import { TASK_COLUMNS, TASK_STATUS_META, PRIORITY_META, timeAgo } from "@/lib/jarvis/ui"

interface TaskBoardProps {
  tasks: AgentTask[]
  /** When true, task cards show which business they belong to. */
  showBusiness: boolean
}

export default function TaskBoard({ tasks, showBusiness }: TaskBoardProps) {
  const columns = TASK_COLUMNS.map((status) => ({
    status,
    meta: TASK_STATUS_META[status],
    items: tasks.filter((t) => t.status === status),
  }))

  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex gap-4 min-w-max">
        {columns.map(({ status, meta, items }) => (
          <div key={status} className="w-64 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2.5 px-0.5">
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              <span className="text-sm font-semibold text-zinc-700">{meta.column}</span>
              <span className="text-xs text-zinc-400 font-medium">{items.length}</span>
            </div>

            <div className="space-y-2.5">
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-zinc-200 py-6 text-center text-xs text-zinc-400">
                  Nothing here
                </div>
              )}
              {items.map((task) => (
                <TaskCard key={task.id} task={task} showBusiness={showBusiness} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskCard({ task, showBusiness }: { task: AgentTask; showBusiness: boolean }) {
  const agent = getAgent(task.agentId)
  const business = getBusiness(task.businessId)
  const priority = PRIORITY_META[task.priority]

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm hover:border-zinc-300 transition-colors">
      <p className="text-sm text-zinc-800 leading-snug">{task.title}</p>

      <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
        {showBusiness && business && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium"
            style={{ backgroundColor: `${business.accent}1a`, color: business.accent }}
          >
            <span>{business.emoji}</span>
            {business.name}
          </span>
        )}
        <span className="text-zinc-500">{agent?.name ?? "—"}</span>
        <span className="text-zinc-300">•</span>
        <span className={priority.className}>{priority.label}</span>
        <span className="text-zinc-300 ml-auto">{timeAgo(task.updatedAt)}</span>
      </div>
    </div>
  )
}
