import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const material = await prisma.studyMaterial.findUnique({
      where: { id },
      include: {
        chunks: {
          select: {
            id: true,
            chunkIndex: true,
            content: true,
          },
          orderBy: { chunkIndex: "asc" },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            questionCount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Study material not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ material });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get material" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.studyMaterial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Material deleted." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete material" },
      { status: 500 }
    );
  }
}
