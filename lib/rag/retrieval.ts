import { prisma } from "@/lib/db/prisma";

export async function retrieveRelevantChunks(
  materialId: string,
  query: string,
  topK: number = 4
): Promise<string[]> {
  const chunks = await prisma.documentChunk.findMany({
    where: { materialId },
    select: { content: true, embedding: true, chunkIndex: true },
    orderBy: { chunkIndex: "asc" },
  });

  if (chunks.length === 0) return [];

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const scored = chunks.map((chunk) => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      const regex = new RegExp(word, "gi");
      const matches = contentLower.match(regex);
      score += matches ? matches.length : 0;
    }

    return { content: chunk.content, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const topChunks = scored.slice(0, topK);
  const nonZero = topChunks.filter((c) => c.score > 0);

  if (nonZero.length > 0) {
    return nonZero.map((c) => c.content);
  }

  return chunks.slice(0, topK).map((c) => c.content);
}

export async function getAllChunks(
  materialId: string,
  maxChunks: number = 20
): Promise<string[]> {
  const chunks = await prisma.documentChunk.findMany({
    where: { materialId },
    select: { content: true },
    orderBy: { chunkIndex: "asc" },
    take: maxChunks,
  });
  return chunks.map((c) => c.content);
}
