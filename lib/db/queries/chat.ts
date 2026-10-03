import { prisma } from "../prisma";

export async function getChatSessionsByUser(userId: string, limit = 20) {
  return prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      material: {
        select: { id: true, title: true },
      },
      _count: {
        select: { messages: true },
      },
    },
  });
}

export async function getChatSessionById(id: string) {
  return prisma.chatSession.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      material: {
        select: { id: true, title: true },
      },
    },
  });
}

export async function createChatSession(data: {
  userId: string;
  materialId?: string | null;
  title: string;
  mode: string;
}) {
  return prisma.chatSession.create({
    data: {
      userId: data.userId,
      materialId: data.materialId || null,
      title: data.title,
      mode: data.mode,
    },
  });
}

export async function saveChatMessage(data: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}) {
  return prisma.chatMessage.create({
    data: {
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      sources: data.sources && data.sources.length > 0 ? data.sources : undefined,
    },
  });
}
