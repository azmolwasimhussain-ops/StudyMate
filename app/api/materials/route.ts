import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDefaultUser } from "@/lib/db/queries/user";
import {
  getMaterialsByUser,
  createStudyMaterialRecord,
} from "@/lib/db/queries/materials";
import { processDocument } from "@/lib/documents/processor";

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const materials = await getMaterialsByUser(user.id);
    return NextResponse.json({ materials });
  } catch (error: any) {
    console.error("Fetch materials error:", error);
    return NextResponse.json(
      { error: "Failed to load study materials." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { title, content } = body;

    if (!title || !content || content.trim().length < 20) {
      return NextResponse.json(
        { error: "Title and at least 20 characters of study notes are required." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(content, "utf-8");

    const material = await createStudyMaterialRecord({
      userId: user.id,
      title: title.trim(),
      fileName: `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.txt`,
      fileType: "text/plain",
      fileSize: buffer.length,
      status: "processing",
    });

    const result = await processDocument(
      material.id,
      buffer,
      "text/plain",
      material.fileName
    );

    return NextResponse.json({
      success: true,
      material: {
        ...material,
        status: "ready",
        chunkCount: result.chunkCount,
      },
    });
  } catch (error: any) {
    console.error("Create manual material error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create material." },
      { status: 500 }
    );
  }
}
