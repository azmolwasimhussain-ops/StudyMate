import { prisma } from "../prisma";

export async function getMaterialsByUser(userId: string) {
  return prisma.studyMaterial.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          chunks: true,
          quizzes: true,
          chatSessions: true,
        },
      },
    },
  });
}

export async function getMaterialById(id: string) {
  return prisma.studyMaterial.findUnique({
    where: { id },
    include: {
      chunks: {
        select: {
          id: true,
          chunkIndex: true,
          content: true,
        },
        orderBy: { chunkIndex: "asc" },
      },
      quizzes: {
        select: {
          id: true,
          title: true,
          questionCount: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function createStudyMaterialRecord(data: {
  userId: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status?: string;
}) {
  return prisma.studyMaterial.create({
    data: {
      userId: data.userId,
      title: data.title,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      status: data.status || "processing",
    },
  });
}

export async function updateStudyMaterialStatus(
  id: string,
  data: {
    status: string;
    chunkCount?: number;
    pageCount?: number;
  }
) {
  return prisma.studyMaterial.update({
    where: { id },
    data,
  });
}

export async function deleteStudyMaterialRecord(id: string) {
  return prisma.studyMaterial.delete({
    where: { id },
  });
}
