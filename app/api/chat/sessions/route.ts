import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateDefaultUser } from "@/lib/db/user";

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
          material: {
            select: { id: true, title: true },
          },
        },
      });

      if (!session) {
        return NextResponse.json(
          { error: "Session not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ session });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        material: {
          select: { id: true, title: true },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load chat history." },
      { status: 500 }
    );
  }
}
