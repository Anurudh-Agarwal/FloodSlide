import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = (process.env.FLOOD_MODEL_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  try {
    const upstream = await fetch(`${baseUrl}/v1/live-predictions`, { cache: "no-store" });
    const result = await upstream.json();
    return NextResponse.json(result, { status: upstream.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Live ML service unavailable" }, { status: 503 });
  }
}
