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
      participant_id,
      amount,
    } = await req.json() as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      participant_id: string;
      amount: number;
    };

    // Verify HMAC signature — prevents tampered callbacks
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Signature valid — persist payment as success
    const { data, error } = await supabase
      .from("giveaway_payments")
      .insert({
        participant_id,
        amount,
        currency: "INR",
        payment_method: "Razorpay",
        status: "success",
        session_id: razorpay_payment_id,
        note: razorpay_order_id,
      })
      .select("id, participant_id, amount, status, session_id, created_at")
      .single();

    if (error) {
      console.error("[razorpay/verify] db insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag("giveaway-payments", "max");
    revalidateTag("giveaway-participants", "max");

    return NextResponse.json({ ok: true, payment: data });
  } catch (err) {
    console.error("[razorpay/verify] error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
