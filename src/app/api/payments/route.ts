import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// Uses the secret key — this runs server-side only, never exposed to the browser.
// Secret key bypasses RLS so inserts always work regardless of RLS policy.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export type PaymentStatus = "pending" | "success" | "failed";

interface CreatePaymentBody {
  participant_id: string;
  amount?: number;
  currency?: string;
  payment_method?: string;
  status: PaymentStatus;
  session_id?: string;
  note?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreatePaymentBody;
    const {
      participant_id,
      amount = 1,
      currency = "INR",
      payment_method = "Transfer",
      status,
      session_id,
      note,
    } = body;

    if (!participant_id) {
      return NextResponse.json(
        { error: "participant_id is required" },
        { status: 400 }
      );
    }

    if (!["pending", "success", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "status must be pending | success | failed" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("giveaway_payments")
      .insert({
        participant_id,
        amount,
        currency,
        payment_method,
        status,
        session_id: session_id ?? null,
        note: note ?? null,
      })
      .select("id, participant_id, amount, currency, payment_method, status, session_id, created_at")
      .single();

    if (error) {
      console.error("[payments] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Bust the payments cache — new row added
    revalidateTag("giveaway-payments", "max");
    revalidateTag("giveaway-participants", "max"); // participant's payment count changed

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[payments] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { id: string; status: PaymentStatus };
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    if (!["pending", "success", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "status must be pending | success | failed" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("giveaway_payments")
      .update({ status })
      .eq("id", id)
      .select("id, status, updated_at")
      .single();

    if (error) {
      console.error("[payments] update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Bust the payments cache — status changed
    revalidateTag("giveaway-payments", "max");
    revalidateTag("giveaway-participants", "max");

    return NextResponse.json(data);
  } catch (err) {
    console.error("[payments] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
