import { NextResponse } from "next/server";
import { getPayments } from "@/lib/data";

export async function GET() {
  const data = await getPayments();
  return NextResponse.json(data);
}
