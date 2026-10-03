import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDefaultUser } from "@/lib/db/queries/user";
import {
  createStudyMaterialRecord,
  updateStudyMaterialStatus,
} from "@/lib/db/queries/materials";
import { processDocument } from "@/lib/documents/processor";
import { MAX_FILE_SIZE } from "@/lib/constants/config";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const titleOverride = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type || "application/octet-stream";

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 25MB limit." },
        { status: 400 }
      );
    }

    const title =
      titleOverride?.trim() ||
      fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    const material = await createStudyMaterialRecord({
      userId: user.id,
      title,
      fileName,
      fileType,
      fileSize,
      status: "processing",
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const result = await processDocument(
        material.id,
        buffer,
        fileType,
        fileName
      );

      return NextResponse.json({
        success: true,
        materialId: material.id,
        title: material.title,
        chunkCount: result.chunkCount,
        message: "Material processed and indexed successfully!",
      });
    } catch (procErr: any) {
      console.error("Document processing failed:", procErr);
      await updateStudyMaterialStatus(material.id, { status: "error" });

      return NextResponse.json(
        {
          error: procErr.message || "Failed to parse document content.",
          materialId: material.id,
        },
        { status: 422 }
      );
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload handler failed" },
      { status: 500 }
    );
  }
}
