import { NextRequest, NextResponse } from "next/server";
import {
  getMaterialById,
  deleteStudyMaterialRecord,
} from "@/lib/db/queries/materials";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const material = await getMaterialById(id);

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
    await deleteStudyMaterialRecord(id);

    return NextResponse.json({ success: true, message: "Material deleted." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete material" },
      { status: 500 }
    );
  }
}
