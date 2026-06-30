import { NextRequest, NextResponse } from "next/server";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { firstZodError } from "@/lib/validation";
import { adminOtpSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimit(`otp:${ip}`, LIMITS.otp.limit, LIMITS.otp.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many OTP attempts. Try again in 15 minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = adminOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { otp } = parsed.data;
    const adminOtp = process.env.ADMIN_OTP;

    if (!adminOtp) {
      console.error("[admin/verify-otp] ADMIN_OTP not set");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (otp !== adminOtp) {
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
