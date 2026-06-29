import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { otp } = await req.json() as { otp: string };

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
