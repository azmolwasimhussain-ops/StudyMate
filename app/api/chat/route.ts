import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateDefaultUser } from "@/lib/db/user";
import { generateStudyAnswer } from "@/lib/ai";
import { retrieveRelevantChunks } from "@/lib/documents/processor";

export const maxDuration = 120; // 2 minutes for local inference

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { query, materialId, mode = "detailed", sessionId } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Question query is required." },
        { status: 400 }
      );
    }

    let context = "";
    let materialTitle = "";
    let sourceChunks: string[] = [];

    if (materialId) {
      const material = await prisma.studyMaterial.findUnique({
        where: { id: materialId },
        select: { title: true },
      });

      if (material) {
        materialTitle = material.title;
        sourceChunks = await retrieveRelevantChunks(materialId, query, 4);
        context = sourceChunks.join("\n\n---\n\n");
      }
    }

    // Get or create session
    let session = sessionId
      ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
      : null;

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: user.id,
          materialId: materialId || null,
          title: query.slice(0, 45) + (query.length > 45 ? "..." : ""),
          mode: mode as string,
        },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: query.trim(),
      },
    });

    // Call open-weight AI model
    let aiResponse;
    try {
      aiResponse = await generateStudyAnswer({
        query: query.trim(),
        context,
        mode: mode as "simple" | "detailed" | "exam_ready",
        materialTitle: materialTitle || undefined,
      });
    } catch (aiErr: any) {
      console.error("AI Generation error:", aiErr);
      return NextResponse.json(
        {
          error:
            "AI model failed to generate response. Please ensure Ollama is running (`ollama serve`). " +
            (aiErr.message || ""),
          sessionId: session.id,
        },
        { status: 503 }
      );
    }

    // Save assistant message
    const savedAssistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: aiResponse.content,
        sources: sourceChunks.length > 0 ? sourceChunks : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      messageId: savedAssistantMessage.id,
      content: aiResponse.content,
      model: aiResponse.model,
      sources: sourceChunks,
      mode,
    });
  } catch (error: any) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat message." },
      { status: 500 }
    );
  }
}
