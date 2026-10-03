import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDefaultUser } from "@/lib/db/queries/user";
import { getMaterialById } from "@/lib/db/queries/materials";
import {
  getQuizzesByUser,
  createQuizWithQuestions,
} from "@/lib/db/queries/quiz";
import { generateQuizQuestions } from "@/lib/ai/quiz";
import { getAllChunks } from "@/lib/rag/retrieval";
import { QuizDifficulty, QuizQuestionType } from "@/types/quiz";
import { RAG_CONFIG } from "@/lib/constants/config";

export const maxDuration = 120;

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const quizzes = await getQuizzesByUser(user.id);
    return NextResponse.json({ quizzes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load quizzes." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await getOrCreateDefaultUser();
    const body = await req.json();
    const {
      materialId,
      numQuestions = 5,
      difficulty = "medium",
      questionType = "mcq",
    } = body;

    if (!materialId) {
      return NextResponse.json(
        { error: "Study material must be selected to generate a quiz." },
        { status: 400 }
      );
    }

    const material = await getMaterialById(materialId);

    if (!material) {
      return NextResponse.json(
        { error: "Selected study material was not found." },
        { status: 404 }
      );
    }

    const chunks = await getAllChunks(materialId, RAG_CONFIG.MAX_CHUNKS_FOR_QUIZ);
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No study content available in this material." },
        { status: 400 }
      );
    }

    const context = chunks.join("\n\n---\n\n");

    let generated;
    try {
      generated = await generateQuizQuestions({
        context,
        numQuestions: Math.min(Math.max(Number(numQuestions), 3), 20),
        difficulty: difficulty as QuizDifficulty,
        questionType: questionType as QuizQuestionType,
      });
    } catch (aiErr: any) {
      console.error("Quiz generation AI error:", aiErr);
      return NextResponse.json(
        {
          error:
            "AI quiz generation failed. Please verify Ollama is active. " +
            (aiErr.message || ""),
        },
        { status: 503 }
      );
    }

    if (!generated.questions || generated.questions.length === 0) {
      return NextResponse.json(
        { error: "AI failed to produce quiz questions from material." },
        { status: 422 }
      );
    }

    const quiz = await createQuizWithQuestions({
      materialId: material.id,
      title: `${material.title} Quiz (${difficulty.toUpperCase()})`,
      difficulty,
      questionCount: generated.questions.length,
      questions: generated.questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic || material.title,
      })),
    });

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      quiz,
    });
  } catch (error: any) {
    console.error("Quiz API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create quiz." },
      { status: 500 }
    );
  }
}
