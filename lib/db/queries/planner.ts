import { prisma } from "../prisma";

export async function getStudyPlansByUser(userId: string) {
  return prisma.studyPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        orderBy: { day: "asc" },
      },
    },
  });
}

export async function createStudyPlanWithTasks(data: {
  userId: string;
  title: string;
  goal: string;
  examDate?: Date | null;
  hoursPerDay: number;
  topics: string[];
  tasks: Array<{
    day: number;
    title: string;
    description?: string | null;
    duration: number;
  }>;
}) {
  return prisma.studyPlan.create({
    data: {
      userId: data.userId,
      title: data.title,
      goal: data.goal,
      examDate: data.examDate || null,
      hoursPerDay: data.hoursPerDay,
      topics: data.topics,
      tasks: {
        create: data.tasks.map((t) => ({
          day: t.day,
          title: t.title,
          description: t.description || null,
          duration: t.duration,
          completed: false,
        })),
      },
    },
    include: {
      tasks: {
        orderBy: { day: "asc" },
      },
    },
  });
}

export async function updateStudyTaskCompletion(taskId: string, completed: boolean) {
  return prisma.studyTask.update({
    where: { id: taskId },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });
}

export async function deleteStudyPlanRecord(id: string) {
  return prisma.studyPlan.delete({
    where: { id },
  });
}
