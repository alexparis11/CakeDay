// ============================================================
// Jarvis — multi-agent business command center
// ============================================================
// Types for the unified control room that sits ABOVE individual
// businesses. A roster of specialized agents each own a domain
// (revenue, social, inbox, support, ads, content…) and work tasks
// across every business you run.
//
// This layer is intentionally storage-agnostic. v1 runs on the
// seed data in ./data.ts so the dashboard works out of the box;
// each selector can later be backed by Supabase / live integrations
// without touching the UI.
// ============================================================

export type BusinessStatus = "active" | "building" | "paused"

/**
 * The domains a specialized agent can own. Each maps to one of the
 * capabilities from the Jarvis build plan (voice, revenue, social,
 * inbox, ads, support, browser, scheduling, orchestration).
 */
export type AgentDomain =
  | "orchestrator"
  | "revenue"
  | "content"
  | "social"
  | "ads"
  | "inbox"
  | "support"
  | "analytics"
  | "browser"
  | "ops"

export type AgentStatus =
  | "working" // actively running a task
  | "idle" // healthy, nothing queued
  | "needs_input" // blocked waiting on you
  | "error" // last run failed
  | "offline" // integration not connected yet

export type TaskStatus =
  | "queued"
  | "in_progress"
  | "needs_approval"
  | "blocked"
  | "done"

export type TaskPriority = "low" | "medium" | "high" | "urgent"

export type ActivityType = "info" | "success" | "warning" | "action_required"

/** A business, project, or company Jarvis oversees. */
export interface Business {
  id: string
  name: string
  /** One-line description of what it does. */
  tagline: string
  /** Emoji used as a lightweight brand marker in the UI. */
  emoji: string
  /** Tailwind-friendly hex accent, used for the business chip. */
  accent: string
  status: BusinessStatus
  /** Monthly recurring revenue in whole currency units (e.g. GBP). */
  mrr: number
  /** MRR change vs. previous month, as a signed percentage. */
  mrrChangePct: number
  currency: string
  /** Last 8 periods of MRR, oldest → newest. Drives the sparkline. */
  mrrTrend: number[]
}

/** The tool/integration an agent uses to actually do its job. */
export interface AgentIntegration {
  /** Human label, e.g. "Gmail MCP". */
  label: string
  /** Whether the integration is wired up in this environment yet. */
  connected: boolean
}

/** A specialized agent in the Jarvis roster. */
export interface Agent {
  id: string
  name: string
  domain: AgentDomain
  /** Short description of the agent's remit. */
  role: string
  status: AgentStatus
  integration: AgentIntegration
  /** What the agent is doing right now (null when idle/offline). */
  currentTask: string | null
  /** ISO timestamp of the agent's most recent activity. */
  lastActiveAt: string
  /** IDs of businesses this agent covers. Empty = all businesses. */
  businessIds: string[]
}

/** A unit of work owned by an agent, scoped to a business. */
export interface AgentTask {
  id: string
  title: string
  agentId: string
  businessId: string
  status: TaskStatus
  priority: TaskPriority
  /** ISO timestamp. */
  updatedAt: string
}

/** An entry in the unified activity feed. */
export interface ActivityEvent {
  id: string
  agentId: string
  businessId: string
  type: ActivityType
  message: string
  /** ISO timestamp. */
  at: string
}
