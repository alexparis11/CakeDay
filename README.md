# CakeDay 🎂

B2B SaaS platform that automates employee birthday cake deliveries.

Built with **Next.js 15** (App Router), **Supabase**, **Stripe**, and **Resend**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router (TypeScript) |
| Database + Auth | Supabase (Postgres + Auth + RLS) |
| Payments | Stripe |
| Email | Resend + React Email |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Deploy | Vercel |

---

## Local Setup

### Prerequisites

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- A Supabase project
- A Stripe account
- A Resend account

### 1. Clone and install

```bash
cd cakeday
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (found in Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (never expose client-side) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from Stripe Dashboard |
| `STRIPE_STARTER_PRICE_ID` | Stripe Price ID for Starter plan (£49/mo) |
| `STRIPE_GROWTH_PRICE_ID` | Stripe Price ID for Growth plan (£89/mo) |
| `RESEND_API_KEY` | Resend API key (`re_...`) |
| `RESEND_FROM_EMAIL` | From address (e.g. `CakeDay <noreply@yourdomain.com>`) |
| `CRON_SECRET` | Random secret string to protect cron endpoints |
| `NEXT_PUBLIC_APP_URL` | Full URL of the app (e.g. `https://app.yourcakeday.com`) |
| `ADMIN_EMAIL` | Email address to receive bakery dispatch alerts |

### 3. Run database migrations

Make sure you have a Supabase project and the CLI configured:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

Or run the SQL manually in the Supabase Dashboard SQL editor, in order:
1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`

### 4. Set up Stripe products

In your [Stripe Dashboard](https://dashboard.stripe.com/products), create two products:

- **Starter** — £49/month (up to 20 employees)
  - Copy the Price ID → set as `STRIPE_STARTER_PRICE_ID`
- **Growth** — £89/month (up to 50 employees)
  - Copy the Price ID → set as `STRIPE_GROWTH_PRICE_ID`

### 5. Set up Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret and set it as `STRIPE_WEBHOOK_SECRET`.

**Events to subscribe to in production:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

### 6. Create the admin user

The admin account must be created directly in Supabase:

1. Go to Supabase Dashboard → Authentication → Users → Invite user
2. After creation, run this SQL to set the admin role:

```sql
-- Replace with the actual user ID
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@yourdomain.com';

INSERT INTO public.users (id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 7. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in as admin and navigate to `/admin/dashboard`.

---

## Vercel Deployment

### Deploy

```bash
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

Add all environment variables in the Vercel Dashboard → Project → Settings → Environment Variables.

### Vercel Cron Jobs

The `vercel.json` already configures two cron jobs:

```json
{
  "crons": [
    { "path": "/api/cron/birthday-reminders", "schedule": "0 8 * * *" },
    { "path": "/api/cron/birthday-nudges", "schedule": "0 8 * * *" }
  ]
}
```

Both run at **8:00 AM UTC** every day.

Vercel automatically passes an `Authorization: Bearer <CRON_SECRET>` header when invoking cron routes, using the `CRON_SECRET` environment variable you set.

**To test cron routes manually:**

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/birthday-reminders
```

### Stripe webhook in production

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Subscribe to the events listed above
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in Vercel

---

## Project Structure

```
cakeday/
├── emails/                    # React Email templates
│   ├── BirthdayReminder.tsx
│   ├── BirthdayNudge.tsx
│   ├── AdminOrderAlert.tsx
│   └── WelcomeEmail.tsx
├── supabase/migrations/       # SQL schema + RLS policies
│   ├── 001_schema.sql
│   └── 002_rls.sql
├── src/
│   ├── middleware.ts           # Auth guard + role-based routing
│   ├── app/
│   │   ├── (admin)/           # Admin route group (dark sidebar)
│   │   ├── (client)/          # Client route group (light sidebar)
│   │   ├── login/             # Login page
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── layouts/           # AdminShell, ClientShell
│   │   ├── admin/             # Admin-specific components
│   │   └── client/            # Client-specific components
│   ├── lib/
│   │   ├── supabase/          # Client, server, middleware factories
│   │   ├── services/          # Service layer (companies, employees, orders, billing)
│   │   ├── stripe.ts
│   │   └── resend.ts
│   └── types/                 # TypeScript types
└── vercel.json                # Cron schedule config
```

---

## How it works

1. **Admin creates a client** → Company row + Supabase auth user + Stripe customer/subscription + welcome email via Resend
2. **Client uploads employees** → CSV upload with preview and validation
3. **Daily at 8am** → Cron checks for employees with birthdays in 7 days → creates `pending_approval` orders → sends reminder emails
4. **Client approves an order** → Status updated + admin receives dispatch email
5. **If no action for 5+ days** → Nudge email sent to client
6. **Admin marks as dispatched** → Status updated to `dispatched`

---

## Row Level Security

All tables have RLS enabled:

- **Clients** can only read/write data belonging to their own `company_id`
- **Admins** have full read/write access to all tables
- Cron routes and admin server actions use the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS

The `role` is stored in Supabase Auth `app_metadata` (JWT), so role checks in middleware and RLS helpers cost zero extra database queries.
