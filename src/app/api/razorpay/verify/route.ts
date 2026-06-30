import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { firstZodError } from "@/lib/validation";
import { verifySchema } from "@/lib/validation";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimit(`verify:${ip}`, LIMITS.form.limit, LIMITS.form.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstZodError(parsed.error) },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      full_name,
      phone,
      amount,
    } = parsed.data;

    // 1. Verify HMAC signature
    const hmacBody = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(hmacBody)
      .digest("hex");

    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpay_signature, "hex")
    )) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Find or create participant by phone
    const { data: existing } = await supabase
      .from("giveaway_participants")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    let participantId: string;

    if (existing) {
      participantId = existing.id;
    } else {
      const { data: created, error: createError } = await supabase
        .from("giveaway_participants")
        .insert({ full_name, phone })
        .select("id")
        .single();

      if (createError || !created) {
        console.error("[razorpay/verify] participant create error:", createError?.message);
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
      console.error("[razorpay/verify] payment insert error:", paymentError.message);
      return NextResponse.json({ error: "Failed to save payment" }, { status: 500 });
    }

    revalidateTag("giveaway-payments", "max");
    revalidateTag("giveaway-participants", "max");

    return NextResponse.json({ ok: true, payment });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
