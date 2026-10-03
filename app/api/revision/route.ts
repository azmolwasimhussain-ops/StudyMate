import { NextRequest, NextResponse } from "next/server";
import { getMaterialById } from "@/lib/db/queries/materials";
import { generateRevisionNotes } from "@/lib/ai/revision";
import { getAllChunks } from "@/lib/rag/retrieval";
import { RAG_CONFIG } from "@/lib/constants/config";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { materialId } = body;

    if (!materialId) {
      return NextResponse.json(
        { error: "Study material ID is required." },
        { status: 400 }
      );
    }

    const material = await getMaterialById(materialId);

    if (!material) {
      return NextResponse.json(
        { error: "Study material not found." },
        { status: 404 }
      );
    }

    const chunks = await getAllChunks(materialId, RAG_CONFIG.MAX_CHUNKS_FOR_REVISION);
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No text chunks found for this study material." },
        { status: 400 }
      );
    }

    const context = chunks.join("\n\n---\n\n");

    let revisionNotes;
    try {
      revisionNotes = await generateRevisionNotes({
        context,
        materialTitle: material.title,
      });
    } catch (aiErr: any) {
      console.error("Revision notes AI error:", aiErr);
      return NextResponse.json(
        {
          error:
            "AI failed to generate revision notes. Please check Ollama. " +
            (aiErr.message || ""),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      materialTitle: material.title,
      revision: revisionNotes,
    });
  } catch (error: any) {
    console.error("Revision API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate revision material." },
      { status: 500 }
    );
  }
}
