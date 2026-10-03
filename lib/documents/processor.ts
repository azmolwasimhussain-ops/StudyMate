import { prisma } from "@/lib/db/prisma";
import { extractText } from "./parser";
import { cleanText, chunkText } from "@/lib/rag/chunking";
import { generateEmbedding } from "@/lib/rag/embeddings";
import { retrieveRelevantChunks, getAllChunks } from "@/lib/rag/retrieval";

export { extractText } from "./parser";
export { cleanText, chunkText } from "@/lib/rag/chunking";
export { retrieveRelevantChunks, getAllChunks } from "@/lib/rag/retrieval";

export async function processDocument(
  materialId: string,
  buffer: Buffer,
  fileType: string,
  fileName: string
): Promise<{ chunkCount: number }> {
  const rawText = await extractText(buffer, fileType, fileName);
  const cleanedText = cleanText(rawText);

  if (cleanedText.length < 50) {
    throw new Error("Document appears to be empty or unreadable");
  }

  const chunks = chunkText(cleanedText);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    let embedding: number[] = [];
    try {
      embedding = await generateEmbedding(chunk);
    } catch {
    }

    await prisma.documentChunk.create({
      data: {
        materialId,
        content: chunk,
        chunkIndex: i,
        embedding,
        metadata: { length: chunk.length },
      },
    });
  }

  await prisma.studyMaterial.update({
    where: { id: materialId },
    data: {
      status: "ready",
      chunkCount: chunks.length,
    },
  });

  return { chunkCount: chunks.length };
}
