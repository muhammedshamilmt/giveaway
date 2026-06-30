# Security Guide — Giveaway App

## Pre-Deploy Checklist

Run through this before every production deployment.

### Secrets & Environment
- [ ] `.env.local` is NOT committed to git — verify with `git status` (`.env*` is in `.gitignore`)
- [ ] All secrets are set in the hosting platform's env config (Vercel dashboard → Environment Variables)
- [ ] `ADMIN_PASSWORD` is a strong random string (min 32 chars)
- [ ] `ADMIN_OTP` is changed from the default `12345`
- [ ] `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set server-side only (no `NEXT_PUBLIC_` prefix)
- [ ] `SUPABASE_SECRET_KEY` is set server-side only (no `NEXT_PUBLIC_` prefix)
- [ ] `ALLOWED_ORIGIN` is set to your production domain (e.g. `https://yourdomain.com`)

### Build & Runtime
- [ ] `NODE_ENV=production` is set in the hosting environment
- [ ] No `console.log` with PII in production code
- [ ] HTTPS is enforced — no HTTP in production

### Database (Supabase)
- [ ] RLS is enabled on `giveaway_participants` and `giveaway_payments` ✓ (already set)
- [ ] `service_role` key is only used server-side ✓
- [ ] Anon key is never used for writes from the browser
- [ ] Run `SELECT * FROM pg_policies;` to audit RLS policies before go-live

### Razorpay
- [ ] Use live keys (`rzp_live_*`) in production, not test keys (`rzp_test_*`)
- [ ] HMAC signature verification is implemented in `/api/razorpay/verify` ✓
- [ ] `timingSafeEqual` is used for signature comparison (prevents timing attacks) ✓

### Dependencies
- [ ] Run `npm audit` and resolve any high/critical vulnerabilities
- [ ] All dependencies are pinned via `package-lock.json`

---

## Security Architecture

### Rate Limiting
Implemented in `src/lib/rateLimit.ts` using an in-memory sliding-window counter.

| Endpoint                        | Limit           |
|---------------------------------|-----------------|
| `POST /api/admin/login`         | 5 req / 15 min  |
| `POST /api/admin/verify-otp`    | 3 req / 15 min  |
| `POST /api/participants`        | 10 req / min    |
| `POST /api/razorpay/order`      | 10 req / min    |
| `POST /api/razorpay/verify`     | 10 req / min    |

> For multi-instance or edge deployments, replace the in-memory `Map` in `rateLimit.ts` with a Redis/Upstash counter.

### Input Validation
All API routes validate input with Zod schemas defined in `src/lib/validation.ts`.
Client-side validation (required fields, phone format) is UX only — **server-side is the security boundary**.

Schemas:
- `participantSchema` — full_name (2–100 chars), phone (5–20 chars), both required
- `orderSchema` — amount (positive, max 100,000), currency (3-char ISO)
- `verifySchema` — all Razorpay fields + full_name + phone + amount
- `adminLoginSchema` — email format, password non-empty
- `adminOtpSchema` — exactly 5 numeric digits

### Admin Authentication
- Email + password verified server-side in `/api/admin/login` against `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- OTP verified server-side in `/api/admin/verify-otp` against `ADMIN_OTP`
- Session stored in `localStorage` (remember me) or `sessionStorage` (default)
- No secrets are ever exposed to the client bundle

### Security Headers
Set in two places for defence-in-depth:

**`src/middleware.ts`** (Edge — runs on every request):
- `Content-Security-Policy` — restricts scripts to self + Razorpay checkout
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Strict-Transport-Security` — enforces HTTPS (production only)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disables camera, mic, geolocation

**`next.config.ts`** — second layer for the same headers.

### CORS
Configured in `src/middleware.ts`.
- Development: all origins allowed
- Production: only origins in `ALLOWED_ORIGIN` env var are permitted (comma-separated for multiple)

### Payment Security
- Razorpay order is created **server-side** — amount cannot be tampered by the client
- HMAC-SHA256 signature is verified server-side using `RAZORPAY_KEY_SECRET`
- `crypto.timingSafeEqual` is used for signature comparison (prevents timing attacks)
- Participant + payment are only written to DB **after** signature verification passes
- Duplicate payments for the same phone are stored as separate payment rows (each payment attempt is recorded)

### XSS Prevention
- No `dangerouslySetInnerHTML` usage
- No `eval()` or `new Function()` with user input
- CSP header blocks inline scripts not from trusted sources

---

## Reporting a Vulnerability

Please report security issues privately to the admin email rather than opening a public GitHub issue.
