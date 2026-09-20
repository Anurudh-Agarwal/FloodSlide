import { NextResponse } from "next/server";

// Browser clients call this same-origin route. It forwards the canonical ML
// request unchanged, keeping the FastAPI service URL private to the server.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const baseUrl = (process.env.FLOOD_MODEL_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

  try {
    const upstream = await fetch(`${baseUrl}/v1/predictions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const result = await upstream.json().catch(() => ({}));
    return NextResponse.json(result, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "FloodSlide ML service is unavailable",
        detail: error instanceof Error ? error.message : "Network error",
      },
      { status: 503 }
    );
  }
}
// just a fancy comment.