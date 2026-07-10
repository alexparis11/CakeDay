import {
  Bot, PoundSterling, PenLine, Send, Megaphone, Inbox, LifeBuoy,
  BarChart3, Globe, CalendarClock, type LucideIcon,
} from "lucide-react"
import type {
  AgentDomain, AgentStatus, TaskStatus, TaskPriority, ActivityType, BusinessStatus,
} from "./types"

// ============================================================
// Presentation metadata — keeps colors/labels/icons out of the
// components so the whole command center reads as one system.
// ============================================================

export const DOMAIN_ICON: Record<AgentDomain, LucideIcon> = {
  orchestrator: Bot,
  revenue: PoundSterling,
  content: PenLine,
  social: Send,
  ads: Megaphone,
  inbox: Inbox,
  support: LifeBuoy,
  analytics: BarChart3,
  browser: Globe,
  ops: CalendarClock,
}

interface StatusMeta {
  label: string
  /** dot color */
  dot: string
  /** pill classes */
  pill: string
}

export const AGENT_STATUS_META: Record<AgentStatus, StatusMeta> = {
  working: {
    label: "Working",
    dot: "bg-green-500",
    pill: "bg-green-50 text-green-700 border-green-200",
  },
  idle: {
    label: "Idle",
    dot: "bg-zinc-400",
    pill: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  needs_input: {
    label: "Needs you",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    pill: "bg-red-50 text-red-700 border-red-200",
  },
  offline: {
    label: "Not connected",
    dot: "bg-zinc-300",
    pill: "bg-zinc-50 text-zinc-400 border-zinc-200",
  },
}

export const BUSINESS_STATUS_META: Record<BusinessStatus, { label: string; pill: string }> = {
  active: { label: "Active", pill: "bg-green-50 text-green-700 border-green-200" },
  building: { label: "Building", pill: "bg-blue-50 text-blue-700 border-blue-200" },
  paused: { label: "Paused", pill: "bg-zinc-100 text-zinc-500 border-zinc-200" },
}

export const TASK_STATUS_META: Record<TaskStatus, StatusMeta & { column: string }> = {
  needs_approval: {
    label: "Needs approval",
    column: "Needs approval",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  in_progress: {
    label: "In progress",
    column: "In progress",
    dot: "bg-blue-500",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
  },
  blocked: {
    label: "Blocked",
    column: "Blocked",
    dot: "bg-red-500",
    pill: "bg-red-50 text-red-700 border-red-200",
  },
  queued: {
    label: "Queued",
    column: "Queued",
    dot: "bg-zinc-400",
    pill: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  done: {
    label: "Done",
    column: "Done",
    dot: "bg-green-500",
    pill: "bg-green-50 text-green-700 border-green-200",
  },
}

/** Ordered columns for the task board. */
export const TASK_COLUMNS: TaskStatus[] = [
  "needs_approval",
  "in_progress",
  "blocked",
  "queued",
  "done",
]

export const PRIORITY_META: Record<TaskPriority, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "text-red-600" },
  high: { label: "High", className: "text-amber-600" },
  medium: { label: "Medium", className: "text-zinc-500" },
  low: { label: "Low", className: "text-zinc-400" },
}

export const ACTIVITY_META: Record<ActivityType, { dot: string }> = {
  success: { dot: "bg-green-500" },
  info: { dot: "bg-blue-500" },
  warning: { dot: "bg-amber-500" },
  action_required: { dot: "bg-[#FF6B4A]" },
}

/** Compact relative time, e.g. "just now", "42m ago", "3h ago", "2d ago". */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}
