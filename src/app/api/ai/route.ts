import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "AI endpoints are ported in feature phases." }, { status: 501 });
}
