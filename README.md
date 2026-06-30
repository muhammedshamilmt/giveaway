# Giveaway

A mobile-first giveaway entry app with a real Razorpay payment flow and a full-featured admin panel. Built with Next.js 16, Supabase, Tailwind CSS v4, and TypeScript.

---

## What it does

**User flow** — A participant enters their name and phone number (with a country code picker), swipes to pay, and completes payment via Razorpay's native checkout. Their details and payment are only saved to the database after the payment is verified server-side.

**Admin panel** — A protected dashboard at `/admin` that shows live participants, payments, revenue stats, and allows clearing all data. Secured with email + password + OTP authentication.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | Next.js 16.2 (App Router, Turbopack)|
| Language     | TypeScript 5                        |
| Styling      | Tailwind CSS v4                     |
| Database     | Supabase (PostgreSQL + RLS)         |
| Payments     | Razorpay                            |
| Validation   | Zod v4                              |
| Icons        | Lucide React                        |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Entry point — renders PaymentFlow
│   ├── layout.tsx                  # Root layout — loads Razorpay script
│   ├── globals.css
│   ├── admin/
│   │   ├── layout.tsx              # Admin shell with BottomNav + AuthGuard
│   │   ├── page.tsx                # Dashboard — revenue, stats, recent activity
│   │   ├── login/page.tsx          # Login page (email + password + OTP)
│   │   ├── payments/page.tsx       # All transactions
│   │   ├── users/page.tsx          # All participants
│   │   └── settings/page.tsx       # Settings + danger zone (clear data)
│   └── api/
│       ├── participants/           # POST  — find-or-create participant by phone
│       ├── payments/               # POST/PATCH — create and update payment records
│       ├── razorpay/
│       │   ├── order/              # POST — create Razorpay order server-side
│       │   └── verify/             # POST — verify HMAC signature, save participant + payment
│       └── admin/
│           ├── login/              # POST — validate admin credentials
│           ├── verify-otp/         # POST — validate OTP
│           ├── participants/       # GET  — all participants with payments (cached)
│           ├── payments/           # GET  — all payments with participant info (cached)
│           └── clear-data/         # DELETE — wipe all participants and payments
├── components/
│   ├── PaymentFlow.tsx             # Main flow state machine (form → swipe → checkout → receipt)
│   ├── PaymentJourney.tsx          # Name + phone form with country code picker
│   ├── PaymentViews.tsx            # SendMoneyView, StatusBottomSheet, PaymentStatusView
│   ├── SwipeToPay.tsx              # Drag-to-confirm swipe gesture
│   └── admin/
│       ├── AdminLoginFlow.tsx      # Two-step login UI (email/pass → OTP)
│       ├── AdminAuthGuard.tsx      # Client-side session guard
│       ├── ActivityList.tsx        # Reusable list rows
│       ├── Skeleton.tsx            # ActivitySkeleton loading state
│       ├── StatCard.tsx            # Metric card
│       ├── PaymentDetailSheet.tsx  # Payment detail bottom sheet
│       ├── UserDetailSheet.tsx     # Participant detail bottom sheet
│       ├── BottomNav.tsx           # Mobile navigation bar
│       └── ...
├── lib/
│   ├── data.ts                     # Cached Supabase fetchers (use cache + cacheTag)
│   ├── rateLimit.ts                # In-memory sliding-window rate limiter
│   ├── validation.ts               # Zod schemas for all API inputs
│   ├── admin/auth.ts               # Admin session helpers
│   └── supabase/server.ts          # withSupabase helpers
├── middleware.ts                   # Security headers + CORS
└── types/razorpay.d.ts             # Razorpay global type declarations
```

---

## Database Schema

Two tables in Supabase public schema, both with RLS enabled.

```sql
-- Participants — one row per unique phone number
giveaway_participants (
  id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text  NOT NULL,
  phone       text  NOT NULL UNIQUE,
  created_at  timestamptz DEFAULT now()
)

-- Payments — linked to a participant, written only after verified payment
giveaway_payments (
  id             uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid     REFERENCES giveaway_participants(id) ON DELETE CASCADE,
  amount         numeric  NOT NULL DEFAULT 1.00,
  currency       text     NOT NULL DEFAULT 'INR',
  payment_method text     NOT NULL DEFAULT 'Razorpay',
  status         text     CHECK (status IN ('pending', 'success', 'failed')),
  session_id     text,    -- Razorpay payment_id
  note           text,    -- Razorpay order_id
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
)
```

**RLS policies:** anon/authenticated can INSERT; service_role has full access (used by admin API routes).

---

## Payment Flow

```
User fills name + phone
        │
        ▼
POST /api/razorpay/order
Creates a Razorpay order server-side
        │
        ▼
Razorpay checkout modal opens
(UPI, cards, netbanking, wallets)
        │
  ┌─────┴─────┐
  │ Dismissed  │ → back to swipe screen
  └─────┬─────┘
        │ Paid
        ▼
POST /api/razorpay/verify
  1. Verify HMAC-SHA256 signature (timingSafeEqual)
  2. Find or create participant by phone (deduplication)
  3. Insert payment row with status = 'success'
  4. Bust cache tags
        │
        ▼
Success screen → Receipt (shows Razorpay payment ID)
```

> Participant and payment data are **only persisted after a verified successful payment** — no junk rows from abandoned checkouts.

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Razorpay](https://razorpay.com) account (test keys work for development)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

Run this SQL in your Supabase SQL editor (`Dashboard → SQL Editor → New query`):

```sql
create table if not exists public.giveaway_participants (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  phone      text not null,
  created_at timestamptz not null default now(),
  constraint giveaway_participants_phone_unique unique (phone)
);

create table if not exists public.giveaway_payments (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.giveaway_participants(id) on delete cascade,
  amount         numeric(10,2) not null default 1.00 check (amount >= 0),
  currency       text not null default 'INR',
  payment_method text not null default 'Razorpay',
  status         text not null default 'pending' check (status in ('pending','success','failed')),
  session_id     text,
  note           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- RLS
alter table public.giveaway_participants enable row level security;
alter table public.giveaway_payments enable row level security;

create policy "anon can insert participants" on public.giveaway_participants
  for insert to anon, authenticated with check (true);
create policy "anon can insert payments" on public.giveaway_payments
  for insert to anon, authenticated with check (true);
create policy "service role full access participants" on public.giveaway_participants
  for all to service_role using (true) with check (true);
create policy "service role full access payments" on public.giveaway_payments
  for all to service_role using (true) with check (true);
```

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-service-role-key
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/.well-known/jwks.json

# Razorpay (use rzp_test_* for development)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Admin credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=a-strong-random-password-min-32-chars
ADMIN_OTP=12345

# CORS (set to your production domain in production)
ALLOWED_ORIGIN=https://yourdomain.com
```

> **Never commit `.env.local`** — it's already in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the user flow.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

---

## Admin Panel

| Route              | Description                                      |
|--------------------|--------------------------------------------------|
| `/admin/login`     | Two-step login (email + password → OTP)         |
| `/admin`           | Dashboard — revenue, stats, recent activity      |
| `/admin/payments`  | All transactions with detail sheet on tap        |
| `/admin/users`     | All participants with detail sheet on tap        |
| `/admin/settings`  | Admin profile + danger zone (clear all data)     |

**Credentials** are set via environment variables — change `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_OTP` in `.env.local` (or your hosting platform's env config).

---

## API Reference

### Public endpoints

| Method   | Path                       | Description                                  |
|----------|----------------------------|----------------------------------------------|
| `POST`   | `/api/razorpay/order`      | Create a Razorpay order                      |
| `POST`   | `/api/razorpay/verify`     | Verify payment + save participant + payment  |

### Admin endpoints

| Method   | Path                         | Description                                |
|----------|------------------------------|--------------------------------------------|
| `POST`   | `/api/admin/login`           | Validate admin email + password            |
| `POST`   | `/api/admin/verify-otp`      | Validate OTP                               |
| `GET`    | `/api/admin/payments`        | All payments (cached, tag-invalidated)     |
| `GET`    | `/api/admin/participants`    | All participants with payments (cached)    |
| `DELETE` | `/api/admin/clear-data`      | Delete all participants and payments       |

---

## Caching

Data fetching uses Next.js 16 `use cache` + `cacheTag` (`cacheComponents: true` in `next.config.ts`).

- `getPayments()` and `getParticipants()` in `src/lib/data.ts` are cached server-side
- Cache is tagged `giveaway-payments` and `giveaway-participants`
- Every write route calls `revalidateTag(tag, "max")` to invalidate stale data
- `React.cache` wraps both fetchers for per-request deduplication

---

## Security

See [SECURITY.md](./SECURITY.md) for the full security architecture, rate limit table, pre-deploy checklist, and vulnerability reporting.

**Summary:**
- All secrets are server-side only — nothing sensitive is in the client bundle
- Razorpay HMAC signature verified with `crypto.timingSafeEqual` (timing-attack safe)
- Rate limiting on all endpoints (in-memory, per IP)
- Zod validation on every API route — server-side is the security boundary
- CSP, HSTS, X-Frame-Options, and other security headers via middleware
- RLS enabled on both Supabase tables

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Set `ALLOWED_ORIGIN` to your production domain
5. Swap Razorpay test keys (`rzp_test_*`) for live keys (`rzp_live_*`)
6. Deploy

### Other platforms

```bash
npm run build
npm start
```

Requires Node.js runtime (not edge) — the rate limiter and `use cache` directive both require Node.js.

---

## Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## License

Private — all rights reserved.
