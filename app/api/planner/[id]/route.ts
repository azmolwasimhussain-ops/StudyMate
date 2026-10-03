import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Toggle task completion
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { taskId, completed } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required." },
        { status: 400 }
      );
    }

    const task = await prisma.studyTask.update({
      where: { id: taskId },
      data: {
        completed: Boolean(completed),
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update study task." },
      { status: 500 }
    );
  }
}

// Delete study plan
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.studyPlan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Study plan deleted." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete plan." },
      { status: 500 }
    );
  }
}
