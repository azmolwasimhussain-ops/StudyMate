import { NextResponse } from "next/server";
import { getOrCreateDefaultUser } from "@/lib/db/queries/user";
import { getProgressSummaryByUser } from "@/lib/db/queries/progress";

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const summary = await getProgressSummaryByUser(user.id);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load progress analytics." },
      { status: 500 }
    );
  }
}
