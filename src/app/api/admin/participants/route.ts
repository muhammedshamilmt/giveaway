import { NextResponse } from "next/server";
import { getParticipants } from "@/lib/data";

export async function GET() {
  const data = await getParticipants();
  return NextResponse.json(data);
}
