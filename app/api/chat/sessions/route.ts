import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDefaultUser } from "@/lib/db/queries/user";
import {
  getChatSessionById,
  getChatSessionsByUser,
} from "@/lib/db/queries/chat";

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const session = await getChatSessionById(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: "Session not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ session });
    }

    const sessions = await getChatSessionsByUser(user.id, 20);
    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load chat history." },
      { status: 500 }
    );
  }
}
