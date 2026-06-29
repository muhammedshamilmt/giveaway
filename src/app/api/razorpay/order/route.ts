import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "INR", participant_id } = await req.json() as {
      amount: number;
      currency?: string;
      participant_id: string;
    };

    if (!amount || !participant_id) {
      return NextResponse.json(
        { error: "amount and participant_id are required" },
        { status: 400 }
      );
    }

    // Razorpay amounts are in smallest currency unit (paise for INR)
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `rcpt_${participant_id.slice(0, 20)}`,
      notes: { participant_id },
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
