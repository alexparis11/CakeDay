"use client"

import { useMemo, useState } from "react"
import { Sparkles, LayoutGrid, ArrowUpRight, ArrowDownRight } from "lucide-react"
import {
  getBusinesses, getAgentsForBusiness, getTasks, getActivity, getStats,
} from "@/lib/jarvis/data"
import { BUSINESS_STATUS_META } from "@/lib/jarvis/ui"
import StatTiles from "./StatTiles"
import AgentRoster from "./AgentRoster"
import TaskBoard from "./TaskBoard"
import ActivityFeed from "./ActivityFeed"
import Sparkline from "./Sparkline"

export default function JarvisDashboard() {
  // null = the whole portfolio; otherwise a single business id.
  const [selected, setSelected] = useState<string | null>(null)

  const businesses = getBusinesses()
  const { agents, tasks, activity, stats } = useMemo(
    () => ({
      agents: getAgentsForBusiness(selected),
      tasks: getTasks(selected),
      activity: getActivity(selected),
      stats: getStats(selected),
    }),
    [selected]
  )

  const showBusiness = selected === null
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  })
  const needsYou = stats.needsApproval

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Command bar */}
      <header className="bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#FF6B4A] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">Jarvis</h1>
              <p className="text-xs text-zinc-400 mt-0.5">Multi-business command center</p>
            </div>
            <span className="ml-auto text-sm text-zinc-400 hidden sm:block">{today}</span>
          </div>

          {/* Morning briefing */}
          <div className="mt-4 rounded-xl bg-zinc-800/60 border border-zinc-700/50 px-4 py-3">
            <p className="text-sm text-zinc-200">
              <span className="font-semibold text-white">Morning briefing.</span>{" "}
              {needsYou > 0 ? (
                <>
                  {needsYou} thing{needsYou === 1 ? "" : "s"} need your approval across{" "}
                  {businesses.length} businesses. {stats.tasksInProgress} tasks are running now.
                </>
              ) : (
                <>Everything is handled — {stats.tasksInProgress} tasks running, nothing waiting on you.</>
              )}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Business switcher */}
        <BusinessSwitcher selected={selected} onSelect={setSelected} businesses={businesses} />

        {/* Stats */}
        <StatTiles stats={stats} />

        {/* Task board */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold text-zinc-900">Work board</h2>
            <span className="text-sm text-zinc-400">— what every agent is doing</span>
          </div>
          <TaskBoard tasks={tasks} showBusiness={showBusiness} />
        </section>

        {/* Agents + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold text-zinc-900">Your agents</h2>
              <span className="text-sm text-zinc-400">— {agents.length} specialists</span>
            </div>
            <AgentRoster agents={agents} />
          </section>

          <section className="lg:col-span-1">
            <h2 className="text-base font-semibold text-zinc-900 mb-3">Activity</h2>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <ActivityFeed events={activity} showBusiness={showBusiness} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

interface BusinessSwitcherProps {
  selected: string | null
  onSelect: (id: string | null) => void
  businesses: ReturnType<typeof getBusinesses>
}

function BusinessSwitcher({ selected, onSelect, businesses }: BusinessSwitcherProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
      {/* All businesses */}
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 rounded-xl border px-4 py-3 text-left transition-colors min-w-[150px] ${
          selected === null
            ? "border-zinc-900 bg-zinc-900 text-white"
            : "border-zinc-200 bg-white hover:border-zinc-300"
        }`}
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          <span className="font-semibold text-sm">All businesses</span>
        </div>
        <p className={`text-xs mt-1 ${selected === null ? "text-zinc-300" : "text-zinc-500"}`}>
          {businesses.length} ventures
        </p>
      </button>

      {businesses.map((b) => {
        const active = selected === b.id
        const up = b.mrrChangePct >= 0
        const statusMeta = BUSINESS_STATUS_META[b.status]
        return (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className={`flex-shrink-0 rounded-xl border px-4 py-3 text-left transition-colors min-w-[190px] ${
              active ? "border-zinc-900 ring-1 ring-zinc-900 bg-white" : "border-zinc-200 bg-white hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">{b.emoji}</span>
              <span className="font-semibold text-sm text-zinc-900 truncate">{b.name}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${statusMeta.pill}`}>
                {statusMeta.label}
              </span>
              {b.mrr > 0 && (
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-green-600" : "text-red-600"}`}>
                  {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(b.mrrChangePct).toFixed(0)}%
                </span>
              )}
              <span className="ml-auto">
                <Sparkline data={b.mrrTrend} color={b.accent} width={54} height={20} />
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
