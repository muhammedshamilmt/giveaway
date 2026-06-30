import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { firstZodError } from "@/lib/validation";
import { participantSchema } from "@/lib/validation";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimit(`form:${ip}`, LIMITS.form.limit, LIMITS.form.windowMs);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();

    // Validate input
    const parsed = participantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { full_name, phone } = parsed.data;

    // Deduplicate by phone
    const { data: existing } = await supabase
      .from("giveaway_participants")
      .select("id, full_name, phone, created_at")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const { data, error } = await supabase
      .from("giveaway_participants")
      .insert({ full_name, phone })
      .select("id, full_name, phone, created_at")
      .single();

    if (error) {
      console.error("[participants] insert error:", error.message);
      return NextResponse.json({ error: "Failed to save participant" }, { status: 500 });
    }

    revalidateTag("giveaway-participants", "max");
    revalidateTag("giveaway-payments", "max");

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
