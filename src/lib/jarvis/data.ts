import type {
  Agent,
  AgentTask,
  ActivityEvent,
  Business,
} from "./types"

// ============================================================
// Seed data
// ============================================================
// v1 runs entirely on this in-memory seed so the command center
// works with zero configuration. Replace the arrays below (or back
// the selectors at the bottom with Supabase / live APIs) as you
// connect real integrations.
//
// To add or rename a business, edit BUSINESSES. Everything else —
// stat tiles, the business switcher, task grouping — derives from it.
// ============================================================

export const BUSINESSES: Business[] = [
  {
    id: "apulseconnect",
    name: "APulseconnect Ltd",
    tagline: "Digital marketing firm — you're the director",
    emoji: "📈",
    accent: "#6366F1",
    status: "active",
    mrr: 4200,
    mrrChangePct: 9.1,
    currency: "£",
    mrrTrend: [2900, 3100, 3300, 3500, 3650, 3800, 3850, 4200],
  },
  {
    id: "dojo",
    name: "Dojo",
    tagline: "Card-machine sales to Aberdeen businesses — commission",
    emoji: "💳",
    accent: "#7C3AED",
    status: "active",
    mrr: 1600,
    mrrChangePct: 6.7,
    currency: "£",
    mrrTrend: [900, 1100, 1000, 1300, 1250, 1450, 1500, 1600],
  },
  {
    id: "unicred",
    name: "unicred",
    tagline: "Startup — MVP + full UI built, £20k grant secured",
    emoji: "💠",
    accent: "#10B981",
    status: "building",
    mrr: 0,
    mrrChangePct: 0,
    currency: "£",
    mrrTrend: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "autic",
    name: "AUTIC",
    tagline: "Aberdeen Uni Trading & Investment Club — externals (sponsorships)",
    emoji: "📊",
    accent: "#F59E0B",
    status: "active",
    mrr: 0,
    mrrChangePct: 0,
    currency: "£",
    mrrTrend: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "menzies",
    name: "Menzies Aviation OSL",
    tagline: "Finance internship — runs until 28 Aug",
    emoji: "✈️",
    accent: "#0EA5E9",
    status: "active",
    mrr: 0,
    mrrChangePct: 0,
    currency: "£",
    mrrTrend: [0, 0, 0, 0, 0, 0, 0, 0],
  },
]

// ------------------------------------------------------------
// Agent roster — each maps to a capability from the Jarvis plan.
// Agents are generalists that work across every business unless
// businessIds narrows them.
// ------------------------------------------------------------

export const AGENTS: Agent[] = [
  {
    id: "jarvis",
    name: "Jarvis",
    domain: "orchestrator",
    role: "Runs the room. Delegates to specialists, escalates what needs you, and briefs you every morning.",
    status: "working",
    integration: { label: "Subagents + Routines", connected: true },
    currentTask: "Compiling your cross-business morning briefing",
    lastActiveAt: hoursAgo(0.1),
    businessIds: [],
  },
  {
    id: "revenue",
    name: "Ledger",
    domain: "revenue",
    role: "Tracks retainers, commission and invoices across every venture; flags anything overdue.",
    status: "working",
    integration: { label: "RevenueCat MCP + Stripe", connected: false },
    currentTask: "Reconciling APulseconnect retainers and Dojo commission",
    lastActiveAt: hoursAgo(0.5),
    businessIds: [],
  },
  {
    id: "content",
    name: "Quill",
    domain: "content",
    role: "Drafts posts, decks, cold outreach and copy in your voice from the knowledge base.",
    status: "needs_input",
    integration: { label: "Knowledge base (markdown)", connected: true },
    currentTask: "3 drafts waiting for your approval",
    lastActiveAt: hoursAgo(1.1),
    businessIds: [],
  },
  {
    id: "social",
    name: "Echo",
    domain: "social",
    role: "Schedules and auto-posts approved content across channels for the firm and its clients.",
    status: "idle",
    integration: { label: "Buffer MCP", connected: false },
    currentTask: null,
    lastActiveAt: hoursAgo(3),
    businessIds: ["apulseconnect"],
  },
  {
    id: "ads",
    name: "Spark",
    domain: "ads",
    role: "Reads client ad performance and adjusts spend within the guardrails you set.",
    status: "offline",
    integration: { label: "Meta Ads connector", connected: false },
    currentTask: null,
    lastActiveAt: hoursAgo(19),
    businessIds: ["apulseconnect"],
  },
  {
    id: "inbox",
    name: "Sift",
    domain: "inbox",
    role: "Triages every inbox, drafts replies and surfaces only what actually needs you.",
    status: "working",
    integration: { label: "Gmail MCP", connected: true },
    currentTask: "Triaging 37 messages — 3 flagged as urgent",
    lastActiveAt: hoursAgo(0.2),
    businessIds: [],
  },
  {
    id: "support",
    name: "Warden",
    domain: "support",
    role: "Answers customers in your brand voice from each venture's knowledge base.",
    status: "idle",
    integration: { label: "Knowledge base (markdown)", connected: true },
    currentTask: null,
    lastActiveAt: hoursAgo(4),
    businessIds: ["unicred"],
  },
  {
    id: "analytics",
    name: "Prism",
    domain: "analytics",
    role: "Pulls Instagram, ad and product analytics into plain-English weekly reads.",
    status: "idle",
    integration: { label: "Meta developer app + token", connected: false },
    currentTask: null,
    lastActiveAt: hoursAgo(6),
    businessIds: [],
  },
  {
    id: "browser",
    name: "Scout",
    domain: "browser",
    role: "Uses a real browser for the web chores no API exposes — lead research, form-filling, portals.",
    status: "idle",
    integration: { label: "Claude for Chrome", connected: false },
    currentTask: null,
    lastActiveAt: hoursAgo(8),
    businessIds: ["dojo"],
  },
  {
    id: "ops",
    name: "Atlas",
    domain: "ops",
    role: "Keeps schedules, deadlines and recurring routines running on time across everything.",
    status: "working",
    integration: { label: "Routines via /schedule", connected: true },
    currentTask: "Watching the Menzies month-end deadline",
    lastActiveAt: hoursAgo(0.8),
    businessIds: [],
  },
]

// ------------------------------------------------------------
// Tasks — the unified work board.
// ------------------------------------------------------------

export const TASKS: AgentTask[] = [
  // APulseconnect (digital marketing firm)
  {
    id: "t1",
    title: "Approve 3 captions for a client's summer campaign",
    agentId: "content",
    businessId: "apulseconnect",
    status: "needs_approval",
    priority: "high",
    updatedAt: hoursAgo(1.1),
  },
  {
    id: "t2",
    title: "Rebalance client ad spend toward the top-performing creative",
    agentId: "ads",
    businessId: "apulseconnect",
    status: "blocked",
    priority: "medium",
    updatedAt: hoursAgo(19),
  },
  {
    id: "t3",
    title: "Pull this month's client performance report",
    agentId: "analytics",
    businessId: "apulseconnect",
    status: "queued",
    priority: "low",
    updatedAt: hoursAgo(6),
  },

  // Dojo (card-machine sales, Aberdeen)
  {
    id: "t4",
    title: "Follow up with 8 Aberdeen leads on card machines",
    agentId: "inbox",
    businessId: "dojo",
    status: "in_progress",
    priority: "high",
    updatedAt: hoursAgo(0.3),
  },
  {
    id: "t5",
    title: "Research 12 hospitality businesses for outreach",
    agentId: "browser",
    businessId: "dojo",
    status: "queued",
    priority: "medium",
    updatedAt: hoursAgo(8),
  },
  {
    id: "t6",
    title: "Draft a cold-outreach sequence for restaurants",
    agentId: "content",
    businessId: "dojo",
    status: "needs_approval",
    priority: "medium",
    updatedAt: hoursAgo(2),
  },

  // unicred (startup)
  {
    id: "t7",
    title: "Prepare the grant milestone update for funders",
    agentId: "ops",
    businessId: "unicred",
    status: "needs_approval",
    priority: "high",
    updatedAt: hoursAgo(0.8),
  },
  {
    id: "t8",
    title: "Draft launch landing-page copy",
    agentId: "content",
    businessId: "unicred",
    status: "queued",
    priority: "medium",
    updatedAt: hoursAgo(5),
  },
  {
    id: "t9",
    title: "Build the support knowledge base from product docs",
    agentId: "support",
    businessId: "unicred",
    status: "blocked",
    priority: "low",
    updatedAt: hoursAgo(9),
  },

  // AUTIC (uni trading & investment club — externals)
  {
    id: "t10",
    title: "Reply to 3 sponsorship enquiries",
    agentId: "inbox",
    businessId: "autic",
    status: "needs_approval",
    priority: "high",
    updatedAt: hoursAgo(1.4),
  },
  {
    id: "t11",
    title: "Draft the partnership proposal deck",
    agentId: "content",
    businessId: "autic",
    status: "in_progress",
    priority: "medium",
    updatedAt: hoursAgo(2.5),
  },
  {
    id: "t12",
    title: "Chase 2 pending sponsor invoices",
    agentId: "revenue",
    businessId: "autic",
    status: "blocked",
    priority: "low",
    updatedAt: hoursAgo(22),
  },

  // Menzies Aviation OSL (finance internship)
  {
    id: "t13",
    title: "Start the month-end finance reconciliation",
    agentId: "ops",
    businessId: "menzies",
    status: "in_progress",
    priority: "medium",
    updatedAt: hoursAgo(0.8),
  },
  {
    id: "t14",
    title: "Draft the internship handover doc (before 28 Aug)",
    agentId: "content",
    businessId: "menzies",
    status: "queued",
    priority: "low",
    updatedAt: hoursAgo(30),
  },

  // Done today
  {
    id: "t15",
    title: "Send the cross-business morning briefing",
    agentId: "jarvis",
    businessId: "apulseconnect",
    status: "done",
    priority: "medium",
    updatedAt: hoursAgo(0.1),
  },
  {
    id: "t16",
    title: "Clear the overnight inbox and draft replies",
    agentId: "inbox",
    businessId: "apulseconnect",
    status: "done",
    priority: "medium",
    updatedAt: hoursAgo(0.5),
  },
]

// ------------------------------------------------------------
// Activity feed — most recent first.
// ------------------------------------------------------------

export const ACTIVITY: ActivityEvent[] = [
  {
    id: "a1",
    agentId: "jarvis",
    businessId: "apulseconnect",
    type: "success",
    message: "Sent your briefing: 4 approvals waiting, Dojo pipeline up this week, Menzies deadline in view.",
    at: hoursAgo(0.1),
  },
  {
    id: "a2",
    agentId: "inbox",
    businessId: "dojo",
    type: "info",
    message: "Drafted follow-ups for 8 Aberdeen leads — 3 replied and want a card-machine demo.",
    at: hoursAgo(0.3),
  },
  {
    id: "a3",
    agentId: "ops",
    businessId: "menzies",
    type: "warning",
    message: "Month-end reconciliation is due this week — started the working draft for you.",
    at: hoursAgo(0.8),
  },
  {
    id: "a4",
    agentId: "content",
    businessId: "apulseconnect",
    type: "action_required",
    message: "3 client campaign captions drafted in your voice — ready to approve.",
    at: hoursAgo(1.1),
  },
  {
    id: "a5",
    agentId: "inbox",
    businessId: "autic",
    type: "action_required",
    message: "3 sponsorship enquiries need your call on terms before I reply.",
    at: hoursAgo(1.4),
  },
  {
    id: "a6",
    agentId: "ops",
    businessId: "unicred",
    type: "info",
    message: "Grant milestone update drafted for funders — waiting on your numbers.",
    at: hoursAgo(0.8),
  },
  {
    id: "a7",
    agentId: "revenue",
    businessId: "apulseconnect",
    type: "info",
    message: "Logged £4,200 in retainers this month — up 9% on last month.",
    at: hoursAgo(2.2),
  },
]

// ============================================================
// Selectors — the UI reads through these so a future swap to a
// live backend is a one-file change.
// ============================================================

export function getBusinesses(): Business[] {
  return BUSINESSES
}

export function getBusiness(id: string): Business | undefined {
  return BUSINESSES.find((b) => b.id === id)
}

export function getAgents(): Agent[] {
  return AGENTS
}

/** Agents relevant to a business (global agents included), or all when id is null. */
export function getAgentsForBusiness(businessId: string | null): Agent[] {
  if (!businessId) return AGENTS
  return AGENTS.filter(
    (a) => a.businessIds.length === 0 || a.businessIds.includes(businessId)
  )
}

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id)
}

/** Tasks, optionally filtered to a single business. */
export function getTasks(businessId: string | null): AgentTask[] {
  const tasks = businessId
    ? TASKS.filter((t) => t.businessId === businessId)
    : TASKS
  return [...tasks].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

/** Activity feed, optionally filtered to a single business. */
export function getActivity(businessId: string | null): ActivityEvent[] {
  const events = businessId
    ? ACTIVITY.filter((e) => e.businessId === businessId)
    : ACTIVITY
  return [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  )
}

export interface JarvisStats {
  totalMrr: number
  mrrChangePct: number
  currency: string
  activeAgents: number
  totalAgents: number
  needsApproval: number
  tasksInProgress: number
}

/** Top-line stats for the stat tiles, scoped to a business or all. */
export function getStats(businessId: string | null): JarvisStats {
  const businesses = businessId
    ? BUSINESSES.filter((b) => b.id === businessId)
    : BUSINESSES
  const agents = getAgentsForBusiness(businessId)
  const tasks = getTasks(businessId)

  const totalMrr = businesses.reduce((sum, b) => sum + b.mrr, 0)
  const prevMrr = businesses.reduce(
    (sum, b) => sum + (b.mrrTrend.length > 1 ? b.mrrTrend[b.mrrTrend.length - 2] : b.mrr),
    0
  )
  const mrrChangePct = prevMrr > 0 ? ((totalMrr - prevMrr) / prevMrr) * 100 : 0

  return {
    totalMrr,
    mrrChangePct,
    currency: businesses[0]?.currency ?? "£",
    activeAgents: agents.filter((a) => a.status === "working").length,
    totalAgents: agents.length,
    needsApproval: tasks.filter((t) => t.status === "needs_approval").length,
    tasksInProgress: tasks.filter((t) => t.status === "in_progress").length,
  }
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/** Fixed reference "now" so seed timestamps are stable across renders. */
function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString()
}
