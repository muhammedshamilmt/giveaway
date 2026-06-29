import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, phone } = body as { full_name: string; phone: string };

    if (!full_name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "full_name and phone are required" },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim();
    const normalizedName = full_name.trim();

    // Check if a participant with this phone already exists
    const { data: existing } = await supabase
      .from("giveaway_participants")
      .select("id, full_name, phone, created_at")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (existing) {
      // Return the existing participant — same user, no duplicate row
      return NextResponse.json(existing, { status: 200 });
    }

    // New phone number — create participant
    const { data, error } = await supabase
      .from("giveaway_participants")
      .insert({ full_name: normalizedName, phone: normalizedPhone })
      .select("id, full_name, phone, created_at")
      .single();

    if (error) {
      console.error("[participants] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag("giveaway-participants", "max");
    revalidateTag("giveaway-payments", "max");

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[participants] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
