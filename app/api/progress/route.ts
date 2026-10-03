import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateDefaultUser } from "@/lib/db/user";

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();

    // 1. Materials count & total chunks
    const materialsCount = await prisma.studyMaterial.count({
      where: { userId: user.id },
    });

    const totalChunks = await prisma.documentChunk.count({
      where: { material: { userId: user.id } },
    });

    // 2. Quiz attempts & scores
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        quiz: {
          select: { title: true, difficulty: true },
        },
        answers: {
          include: {
            question: {
              select: { topic: true },
            },
          },
        },
      },
    });

    const totalAttempts = quizAttempts.length;
    const avgScore =
      totalAttempts > 0
        ? Math.round(
            quizAttempts.reduce((acc, curr) => acc + curr.score, 0) /
              totalAttempts
          )
        : 0;

    // Weak topics calculation from incorrect answers
    const topicStats: Record<string, { total: number; incorrect: number }> = {};
    for (const attempt of quizAttempts) {
      for (const ans of attempt.answers) {
        const topic = ans.question.topic || "General";
        if (!topicStats[topic]) topicStats[topic] = { total: 0, incorrect: 0 };
        topicStats[topic].total++;
        if (!ans.isCorrect) topicStats[topic].incorrect++;
      }
    }

    const weakTopics = Object.entries(topicStats)
      .map(([topic, stat]) => ({
        topic,
        accuracy: Math.round(((stat.total - stat.incorrect) / stat.total) * 100),
        incorrect: stat.incorrect,
        total: stat.total,
      }))
      .filter((t) => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    const strongTopics = Object.entries(topicStats)
      .map(([topic, stat]) => ({
        topic,
        accuracy: Math.round(((stat.total - stat.incorrect) / stat.total) * 100),
        total: stat.total,
      }))
      .filter((t) => t.accuracy >= 70 && t.total >= 2)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    // 3. Study tasks
    const tasks = await prisma.studyTask.findMany({
      where: { plan: { userId: user.id } },
    });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;

    // 4. Study streak & progress history
    const progressRecords = await prisma.studyProgress.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
    });

    // Calculate streak
    let streak = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      const found = progressRecords.some((p) => {
        const pDate = new Date(p.date);
        pDate.setHours(0, 0, 0, 0);
        return pDate.getTime() === checkDate.getTime();
      });

      if (found) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken
      }
    }

    // Recent activity list
    const recentActivities: Array<{
      id: string;
      type: "upload" | "quiz" | "chat";
      title: string;
      date: Date;
    }> = [];

    const recentMaterials = await prisma.studyMaterial.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    recentMaterials.forEach((m) =>
      recentActivities.push({
        id: `mat-${m.id}`,
        type: "upload",
        title: `Uploaded ${m.title}`,
        date: m.createdAt,
      })
    );

    const recentQuizzes = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { quiz: { select: { title: true } } },
    });
    recentQuizzes.forEach((q) =>
      recentActivities.push({
        id: `qa-${q.id}`,
        type: "quiz",
        title: `Scored ${q.score}% on ${q.quiz.title}`,
        date: q.createdAt,
      })
    );

    recentActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return NextResponse.json({
      materialsCount,
      totalChunks,
      totalAttempts,
      avgScore,
      totalTasks,
      completedTasks,
      streak: Math.max(streak, totalAttempts > 0 ? 1 : 0),
      weakTopics,
      strongTopics,
      recentAttempts: quizAttempts.slice(0, 5).map((a) => ({
        id: a.id,
        quizTitle: a.quiz.title,
        score: a.score,
        total: a.total,
        date: a.createdAt,
      })),
      recentActivities: recentActivities.slice(0, 6),
      studyHistory: progressRecords.map((p) => ({
        date: p.date.toISOString().split("T")[0],
        minutes: p.studyMinutes,
      })),
    });
  } catch (error: any) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load progress analytics." },
      { status: 500 }
    );
  }
}
