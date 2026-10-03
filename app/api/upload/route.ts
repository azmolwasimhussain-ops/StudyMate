import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateDefaultUser } from "@/lib/db/user";
import { processDocument } from "@/lib/documents/processor";

export const maxDuration = 60; // 60 seconds max duration

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

    // Validate size (max 25MB)
    if (fileSize > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 25MB limit." },
        { status: 400 }
      );
    }

    const title =
      titleOverride?.trim() ||
      fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    // Create record in database
    const material = await prisma.studyMaterial.create({
      data: {
        userId: user.id,
        title,
        fileName,
        fileType,
        fileSize,
        status: "processing",
      },
    });

    // Read buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process document synchronously (chunking, cleaning, storing)
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
      await prisma.studyMaterial.update({
        where: { id: material.id },
        data: { status: "error" },
      });

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
