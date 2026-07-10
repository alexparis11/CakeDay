# Jarvis 🪄

A **multi-business command center** — one dashboard for every business you run,
staffed by a roster of specialized agents that each own a domain (revenue,
inbox, content, social, ads, support, analytics, browser, ops) and work tasks
across all of your ventures at once.

Built on **Next.js 16** (App Router) + **Tailwind** + **shadcn/ui**.

> This repo began life as CakeDay and has been repurposed into Jarvis. The
> command center lives at **`/jarvis`** (and is the site's home page). The
> original CakeDay routes still exist in the tree but are no longer the front
> door — they can be removed in a follow-up.

---

## What it does

Open the app and you land on the Jarvis command center:

- **Morning briefing** — a one-line summary of what needs you across every business.
- **Business switcher** — flip between *All businesses* and any single venture; every
  panel below re-scopes instantly.
- **Stat tiles** — portfolio revenue, agents working now, approvals waiting, tasks running.
- **Work board** — a kanban of every agent's tasks (Needs approval → In progress →
  Blocked → Queued → Done).
- **Agent roster** — each specialist, its remit, which integration it uses, whether
  that integration is connected yet, and what it's doing right now.
- **Activity feed** — a live timeline of what the agents have done for you.

The seeded businesses are: **APulseconnect Ltd**, **Dojo**, **unicred**,
**AUTIC**, and **Menzies Aviation OSL**.

---

## The agent roster

Each agent maps to one of the capabilities from the Jarvis build plan. The
dashboard shows which are wired up (`connected`) vs. still to be plugged in.

| Agent | Domain | Does | Integration |
|-------|--------|------|-------------|
| **Jarvis** | Orchestrator | Delegates, escalates, briefs you each morning | Subagents + Routines |
| **Ledger** | Revenue | Tracks retainers, commission, invoices | RevenueCat MCP + Stripe |
| **Quill** | Content | Drafts posts, decks, outreach in your voice | Knowledge base (markdown) |
| **Echo** | Social | Schedules & auto-posts approved content | Buffer MCP |
| **Spark** | Ads | Reads ad performance, adjusts spend | Meta Ads connector |
| **Sift** | Inbox | Triages email, drafts replies | Gmail MCP |
| **Warden** | Support | Answers customers in your brand voice | Knowledge base (markdown) |
| **Prism** | Analytics | Instagram / product analytics into plain English | Meta developer app + token |
| **Scout** | Browser | Web chores no API exposes (lead research, portals) | Claude for Chrome |
| **Atlas** | Ops | Schedules, deadlines, recurring routines | Routines via `/schedule` |

---

## Architecture

Everything is intentionally **storage-agnostic** so the dashboard works with
zero configuration today and grows into real integrations later.

```
src/
├── app/jarvis/page.tsx            # the /jarvis route (also the home page)
├── components/jarvis/
│   ├── JarvisDashboard.tsx        # client shell: business switcher + layout
│   ├── StatTiles.tsx              # top-line KPIs
│   ├── BusinessSwitcher (inline)  # portfolio ⇄ single business
│   ├── AgentRoster.tsx            # the specialist cards
│   ├── TaskBoard.tsx              # unified kanban
│   ├── ActivityFeed.tsx          # timeline
│   └── Sparkline.tsx              # inline revenue trend
└── lib/jarvis/
    ├── types.ts                   # Business / Agent / AgentTask / ActivityEvent
    ├── data.ts                    # seed data + selectors  ← edit me
    └── ui.ts                      # status colors, icons, relative time
```

**The UI never touches raw data — it reads through the selectors in
`lib/jarvis/data.ts`** (`getBusinesses`, `getAgentsForBusiness`, `getTasks`,
`getActivity`, `getStats`). To go live, back those selectors with Supabase or
the real APIs; the components don't change.

### Editing your businesses

Open `src/lib/jarvis/data.ts` and edit the `BUSINESSES` array — the switcher,
stat tiles and task grouping all derive from it. Tasks and activity reference a
business by `id`.

---

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to
`/jarvis`. No env vars or database needed to view the command center; it runs
entirely on the seed data.

---

## Wiring in real integrations (roadmap)

The agent roster doubles as a checklist. In rough priority order:

1. **Sift (Inbox)** — Gmail MCP is already available in this workspace.
2. **Atlas (Ops)** — schedule the morning briefing as a Routine via `/schedule`.
3. **Ledger (Revenue)** — Stripe / RevenueCat for APulseconnect + Dojo.
4. **Quill / Warden (Content & Support)** — point at a markdown knowledge base per business.
5. **Echo / Spark / Prism (Social, Ads, Analytics)** — Buffer MCP + Meta app + Meta Ads.
6. **Scout (Browser)** — Claude for Chrome for Dojo lead research.
7. **Jarvis (Orchestrator)** — real subagents (`.claude/agents/*.md`) per domain.

Each becomes a small change behind one selector — no UI rewrites.
