import { NextResponse } from "next/server";
import { checkAIAvailability } from "@/lib/ai";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const aiStatus = await checkAIAvailability();
    let dbStatus = false;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = true;
    } catch (dbErr) {
      console.error("DB health check error:", dbErr);
    }

    return NextResponse.json({
      status: "ok",
      available: aiStatus.available,
      provider: aiStatus.provider,
      model: aiStatus.model,
      database: dbStatus ? "connected" : "disconnected",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Failed health check",
        available: false,
        provider: process.env.AI_PROVIDER || "ollama",
        model: process.env.AI_MODEL || "gemma2:2b",
        database: "unknown",
      },
      { status: 500 }
    );
  }
}
