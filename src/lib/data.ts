/**
 * Server-only data access layer.
 *
 * Uses Next.js 16 `use cache` + `cacheTag` for persistent caching and
 * React `cache` for per-request deduplication (so multiple callers in the
 * same render never hit Supabase twice).
 *
 * Call `revalidateTag('giveaway-payments')` or `revalidateTag('giveaway-participants')`
 * after any write to bust the relevant cached entries.
 */

import "server-only";
import { cache } from "react";
import { cacheTag, cacheLife } from "next/cache";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbPayment {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: "pending" | "success" | "failed";
  session_id: string | null;
  created_at: string;
  giveaway_participants: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
}

export interface DbParticipant {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  giveaway_payments: {
    id: string;
    amount: number;
    currency: string;
    payment_method: string;
    status: "pending" | "success" | "failed";
    session_id: string | null;
    created_at: string;
  }[];
}

// ─── Cached fetchers ──────────────────────────────────────────────────────────

/**
 * Fetch all payments with participant info.
 * Cached with tag "giveaway-payments", revalidates every 60s (stale-while-revalidate).
 * Deduplicated within a single render via React.cache.
 */
export const getPayments = cache(async function getPayments(): Promise<DbPayment[]> {
  "use cache";
  cacheTag("giveaway-payments");
  cacheLife("seconds"); // short revalidation — admin panel should stay fresh

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("giveaway_payments")
    .select(`
      id,
      amount,
      currency,
      payment_method,
      status,
      session_id,
      created_at,
      giveaway_participants (
        id,
        full_name,
        phone
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[data] getPayments error:", error.message);
    return [];
  }

  return (data ?? []) as unknown as DbPayment[];
});

/**
 * Fetch all participants with their payments.
 * Cached with tag "giveaway-participants", revalidates every 60s.
 * Deduplicated within a single render via React.cache.
 */
export const getParticipants = cache(async function getParticipants(): Promise<DbParticipant[]> {
  "use cache";
  cacheTag("giveaway-participants");
  cacheLife("seconds");

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("giveaway_participants")
    .select(`
      id,
      full_name,
      phone,
      created_at,
      giveaway_payments (
        id,
        amount,
        currency,
        payment_method,
        status,
        session_id,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[data] getParticipants error:", error.message);
    return [];
  }

  return (data ?? []) as DbParticipant[];
});
