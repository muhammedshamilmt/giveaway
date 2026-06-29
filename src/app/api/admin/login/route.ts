import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as {
      email: string;
      password: string;
    };

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("[admin/login] ADMIN_EMAIL or ADMIN_PASSWORD not set");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const valid =
      email.trim().toLowerCase() === adminEmail.toLowerCase() &&
      password === adminPassword;

    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
