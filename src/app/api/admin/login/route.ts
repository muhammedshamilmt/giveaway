import { NextRequest, NextResponse } from "next/server";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { firstZodError } from "@/lib/validation";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  // Strict rate limit on auth endpoints
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimit(`auth:${ip}`, LIMITS.auth.limit, LIMITS.auth.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("[admin/login] ADMIN_EMAIL or ADMIN_PASSWORD not set");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const valid =
      email.toLowerCase() === adminEmail.toLowerCase() &&
      password === adminPassword;

    if (!valid) {
      // Same error message for both wrong email and wrong password — prevents enumeration
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
