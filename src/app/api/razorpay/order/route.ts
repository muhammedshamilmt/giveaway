import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { firstZodError } from "@/lib/validation";
import { orderSchema } from "@/lib/validation";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimit(`order:${ip}`, LIMITS.form.limit, LIMITS.form.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { amount, currency } = parsed.data;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[razorpay/order] error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
