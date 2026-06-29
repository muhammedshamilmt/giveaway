import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function DELETE() {
  try {
    // Delete payments first (FK references participants)
    const { error: paymentsError } = await supabase
      .from("giveaway_payments")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // match all rows

    if (paymentsError) {
      console.error("[clear-data] payments delete error:", paymentsError);
      return NextResponse.json({ error: paymentsError.message }, { status: 500 });
    }

    // Then delete participants
    const { error: participantsError } = await supabase
      .from("giveaway_participants")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (participantsError) {
      console.error("[clear-data] participants delete error:", participantsError);
      return NextResponse.json({ error: participantsError.message }, { status: 500 });
    }

    revalidateTag("giveaway-payments", "max");
    revalidateTag("giveaway-participants", "max");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[clear-data] error:", err);
    return NextResponse.json({ error: "Failed to clear data" }, { status: 500 });
  }
}
