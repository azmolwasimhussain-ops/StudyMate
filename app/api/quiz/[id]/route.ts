import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        material: {
          select: { id: true, title: true },
        },
        questions: {
          orderBy: { createdAt: "asc" },
        },
        attempts: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ quiz });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load quiz." },
      { status: 500 }
    );
  }
}
