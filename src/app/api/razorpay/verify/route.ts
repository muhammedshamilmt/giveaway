import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      full_name,
      phone,
      amount,
    } = await req.json() as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      full_name: string;
      phone: string;
      amount: number;
    };

    // 1. Verify HMAC signature — prevents tampered callbacks
    const hmacBody = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(hmacBody)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // 2. Find or create participant by phone (deduplication)
    const { data: existing } = await supabase
      .from("giveaway_participants")
      .select("id")
      .eq("phone", phone.trim())
      .maybeSingle();

    let participantId: string;

    if (existing) {
      participantId = existing.id;
    } else {
      const { data: created, error: createError } = await supabase
        .from("giveaway_participants")
        .insert({ full_name: full_name.trim(), phone: phone.trim() })
        .select("id")
        .single();

      if (createError || !created) {
        console.error("[razorpay/verify] participant create error:", createError);
        return NextResponse.json({ error: "Failed to save participant" }, { status: 500 });
      }

      participantId = created.id;
    }

    // 3. Save payment as success
    const { data: payment, error: paymentError } = await supabase
      .from("giveaway_payments")
      .insert({
        participant_id: participantId,
        amount,
        currency: "INR",
        payment_method: "Razorpay",
        status: "success",
        session_id: razorpay_payment_id,
        note: razorpay_order_id,
      })
      .select("id, participant_id, amount, status, session_id, created_at")
      .single();

    if (paymentError) {
      console.error("[razorpay/verify] payment insert error:", paymentError);
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    revalidateTag("giveaway-payments", "max");
    revalidateTag("giveaway-participants", "max");

    return NextResponse.json({ ok: true, payment });
  } catch (err) {
    console.error("[razorpay/verify] error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
