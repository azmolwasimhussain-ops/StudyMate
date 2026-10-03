import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateDefaultUser } from "@/lib/db/user";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { quizId, answers, timeTaken } = body;
    // answers format: Array<{ questionId: string, selectedOption: number }>

    if (!quizId || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Quiz ID and answers array are required." },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found." },
        { status: 404 }
      );
    }

    let correctCount = 0;
    const gradedAnswers = [];
    const weakTopicsMap: Record<string, { total: number; incorrect: number }> = {};

    for (const q of quiz.questions) {
      const submitted = answers.find((a: any) => a.questionId === q.id);
      const selected = submitted ? submitted.selectedOption : -1;
      const isCorrect = selected === q.correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      const topicName = q.topic || "General";
      if (!weakTopicsMap[topicName]) {
        weakTopicsMap[topicName] = { total: 0, incorrect: 0 };
      }
      weakTopicsMap[topicName].total++;
      if (!isCorrect) {
        weakTopicsMap[topicName].incorrect++;
      }

      gradedAnswers.push({
        questionId: q.id,
        selected,
        isCorrect,
      });
    }

    const total = quiz.questions.length;
    const score = Math.round((correctCount / total) * 100);

    // Identify weak topics (any topic where accuracy < 60%)
    const weakTopics = Object.entries(weakTopicsMap)
      .filter(([_, stats]) => stats.incorrect / stats.total > 0.4)
      .map(([topic]) => topic);

    // Create QuizAttempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: user.id,
        score,
        total,
        timeTaken: timeTaken || null,
        answers: {
          create: gradedAnswers.map((a) => ({
            questionId: a.questionId,
            selected: a.selected,
            isCorrect: a.isCorrect,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    // Update today's study progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.studyProgress.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      create: {
        userId: user.id,
        date: today,
        studyMinutes: Math.max(Math.round((timeTaken || 120) / 60), 5),
        topicsStudied: weakTopics,
      },
      update: {
        studyMinutes: { increment: Math.max(Math.round((timeTaken || 120) / 60), 5) },
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      correctCount,
      total,
      weakTopics,
      answers: gradedAnswers,
    });
  } catch (error: any) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit quiz attempt." },
      { status: 500 }
    );
  }
}
