import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDefaultUser } from "@/lib/db/queries/user";
import { getMaterialById } from "@/lib/db/queries/materials";
import {
  getChatSessionById,
  createChatSession,
  saveChatMessage,
} from "@/lib/db/queries/chat";
import { generateStudyAnswer } from "@/lib/ai/chat";
import { retrieveRelevantChunks } from "@/lib/rag/retrieval";
import { ChatMode } from "@/types/chat";

export const maxDuration = 120;

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
      const material = await getMaterialById(materialId);
      if (material) {
        materialTitle = material.title;
        sourceChunks = await retrieveRelevantChunks(materialId, query, 4);
        context = sourceChunks.join("\n\n---\n\n");
      }
    }

    let activeSessionId = sessionId;
    if (activeSessionId) {
      const existingSession = await getChatSessionById(activeSessionId);
      if (!existingSession) {
        activeSessionId = undefined;
      }
    }

    if (!activeSessionId) {
      const newSession = await createChatSession({
        userId: user.id,
        materialId: materialId || null,
        title: query.slice(0, 45) + (query.length > 45 ? "..." : ""),
        mode: mode as string,
      });
      activeSessionId = newSession.id;
    }

    await saveChatMessage({
      sessionId: activeSessionId,
      role: "user",
      content: query.trim(),
    });

    let aiResponse;
    try {
      aiResponse = await generateStudyAnswer({
        query: query.trim(),
        context,
        mode: mode as ChatMode,
        materialTitle: materialTitle || undefined,
      });
    } catch (aiErr: any) {
      console.error("AI Generation error:", aiErr);
      return NextResponse.json(
        {
          error:
            "AI model failed to generate response. Please ensure Ollama is running (`ollama serve`). " +
            (aiErr.message || ""),
          sessionId: activeSessionId,
        },
        { status: 503 }
      );
    }

    const savedAssistantMessage = await saveChatMessage({
      sessionId: activeSessionId,
      role: "assistant",
      content: aiResponse.content,
      sources: sourceChunks,
    });

    return NextResponse.json({
      success: true,
      sessionId: activeSessionId,
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
