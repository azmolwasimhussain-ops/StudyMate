import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateDefaultUser } from "@/lib/db/user";
import { generateQuizQuestions } from "@/lib/ai";
import { getAllChunks } from "@/lib/documents/processor";

export const maxDuration = 120;

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const quizzes = await prisma.quiz.findMany({
      where: {
        material: {
          userId: user.id,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        material: {
          select: { id: true, title: true },
        },
        attempts: {
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

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

    const material = await prisma.studyMaterial.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Selected study material was not found." },
        { status: 404 }
      );
    }

    // Retrieve material content
    const chunks = await getAllChunks(materialId, 15);
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No study content available in this material." },
        { status: 400 }
      );
    }

    const context = chunks.join("\n\n---\n\n");

    // Generate questions with AI
    let generated;
    try {
      generated = await generateQuizQuestions({
        context,
        numQuestions: Math.min(Math.max(Number(numQuestions), 3), 20),
        difficulty: difficulty as "easy" | "medium" | "hard",
        questionType: questionType as "mcq" | "mixed",
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

    // Save quiz and questions in database
    const quiz = await prisma.quiz.create({
      data: {
        materialId: material.id,
        title: `${material.title} Quiz (${difficulty.toUpperCase()})`,
        difficulty,
        questionCount: generated.questions.length,
        questions: {
          create: generated.questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            topic: q.topic || material.title,
          })),
        },
      },
      include: {
        questions: true,
      },
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
