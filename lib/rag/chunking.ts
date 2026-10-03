import { RAG_CONFIG } from "@/lib/constants/config";

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[^\x20-\x7E\n\t]/g, " ")
    .trim();
}

export function chunkText(text: string): string[] {
  const chunkSize = RAG_CONFIG.CHUNK_SIZE;
  const chunkOverlap = RAG_CONFIG.CHUNK_OVERLAP;
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue;

    if (
      currentChunk.length + paragraph.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());

      const words = currentChunk.split(" ");
      const overlapWords = words.slice(
        Math.max(0, words.length - Math.floor(chunkOverlap / 5))
      );
      currentChunk = overlapWords.join(" ") + "\n\n" + paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  if (chunks.length === 0) {
    for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
      chunks.push(text.slice(i, i + chunkSize));
      if (i + chunkSize >= text.length) break;
    }
  }

  return chunks.filter((c) => c.length > 50);
}
