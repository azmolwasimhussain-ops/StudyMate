import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDefaultUser } from "@/lib/db/queries/user";
import { getQuizById, saveQuizAttemptRecord } from "@/lib/db/queries/quiz";
import { upsertStudyProgressRecord } from "@/lib/db/queries/progress";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { quizId, answers, timeTaken } = body;

    if (!quizId || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Quiz ID and answers array are required." },
        { status: 400 }
      );
    }

    const quiz = await getQuizById(quizId);

    if (!quiz || !quiz.questions) {
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
        questionId: q.id as string,
        selected,
        isCorrect,
      });
    }

    const total = quiz.questions.length;
    const score = Math.round((correctCount / total) * 100);

    const weakTopics = Object.entries(weakTopicsMap)
      .filter(([_, stats]) => stats.incorrect / stats.total > 0.4)
      .map(([topic]) => topic);

    const attempt = await saveQuizAttemptRecord({
      quizId,
      userId: user.id,
      score,
      total,
      timeTaken: timeTaken || null,
      answers: gradedAnswers,
    });

    const studyMinutes = Math.max(Math.round((timeTaken || 120) / 60), 5);
    await upsertStudyProgressRecord(user.id, studyMinutes, weakTopics);

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
