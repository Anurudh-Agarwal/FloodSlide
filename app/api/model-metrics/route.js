import modelMeta from "@/data/ml/model_meta.json";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ...modelMeta,
    disclaimer:
      "Metrics are from a temporal hold-out on synthetic physics-informed rows, not operational skill on real floods.",
  });
}
