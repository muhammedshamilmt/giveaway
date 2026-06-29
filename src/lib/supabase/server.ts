import { withSupabase } from "@supabase/server";

export { withSupabase };

/**
 * Authenticated handler — requires a valid user JWT.
 * Provides ctx.supabase (RLS-scoped) and ctx.supabaseAdmin (bypasses RLS).
 *
 * Usage:
 *   export default { fetch: userHandler(async (_req, ctx) => { ... }) }
 */
export const userHandler = (
  handler: Parameters<typeof withSupabase>[1]
) => withSupabase({ auth: "user" }, handler);

/**
 * Publishable-key handler — no user auth required, uses publishable key.
 * Safe to call from unauthenticated clients.
 */
export const publishableHandler = (
  handler: Parameters<typeof withSupabase>[1]
) => withSupabase({ auth: "publishable" }, handler);

/**
 * Secret-key handler — full admin access, bypasses RLS entirely.
 * Only use server-side where the secret key is never exposed to clients.
 */
export const secretHandler = (
  handler: Parameters<typeof withSupabase>[1]
) => withSupabase({ auth: "secret" }, handler);
