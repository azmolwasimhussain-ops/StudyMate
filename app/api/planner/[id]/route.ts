import { NextRequest, NextResponse } from "next/server";
import {
  updateStudyTaskCompletion,
  deleteStudyPlanRecord,
} from "@/lib/db/queries/planner";

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

    const task = await updateStudyTaskCompletion(taskId, Boolean(completed));

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update study task." },
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
    await deleteStudyPlanRecord(id);

    return NextResponse.json({ success: true, message: "Study plan deleted." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete plan." },
      { status: 500 }
    );
  }
}
