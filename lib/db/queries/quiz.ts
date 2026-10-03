import { prisma } from "../prisma";

export async function getQuizzesByUser(userId: string) {
  return prisma.quiz.findMany({
    where: {
      material: {
        userId,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      material: {
        select: { id: true, title: true },
      },
      attempts: {
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getQuizById(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      material: {
        select: { id: true, title: true },
      },
      questions: {
        orderBy: { createdAt: "asc" },
      },
      attempts: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
}

export async function createQuizWithQuestions(data: {
  materialId: string;
  title: string;
  difficulty: string;
  questionCount: number;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    topic?: string;
  }>;
}) {
  return prisma.quiz.create({
    data: {
      materialId: data.materialId,
      title: data.title,
      difficulty: data.difficulty,
      questionCount: data.questionCount,
      questions: {
        create: data.questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic,
        })),
      },
    },
    include: {
      questions: true,
    },
  });
}

export async function saveQuizAttemptRecord(data: {
  quizId: string;
  userId: string;
  score: number;
  total: number;
  timeTaken?: number | null;
  answers: Array<{
    questionId: string;
    selected: number;
    isCorrect: boolean;
  }>;
}) {
  return prisma.quizAttempt.create({
    data: {
      quizId: data.quizId,
      userId: data.userId,
      score: data.score,
      total: data.total,
      timeTaken: data.timeTaken || null,
      answers: {
        create: data.answers.map((a) => ({
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
}
