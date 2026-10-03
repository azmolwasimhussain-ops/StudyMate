/**
 * Document processing pipeline
 * Handles PDF, TXT, and Markdown extraction, chunking, and storage
 */

import { prisma } from "@/lib/db/prisma";
import { generateEmbedding } from "@/lib/ai";

const CHUNK_SIZE = 1000; // characters
const CHUNK_OVERLAP = 200; // characters

/**
 * Extract text from a file buffer based on type
 */
export async function extractText(
  buffer: Buffer,
  fileType: string,
  fileName: string
): Promise<string> {
  const mimeType = fileType.toLowerCase();

  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    return extractPdfText(buffer);
  } else if (
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".md")
  ) {
    return buffer.toString("utf-8");
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Extract text from PDF using pdf-parse
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Import directly from lib to avoid index.js debug file read bug
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");
    const data = await pdfParse(buffer);
    if (data && data.text && data.text.trim()) {
      return data.text;
    }
  } catch (error) {
    console.error("PDF parse error:", error);
  }

  // Fallback: extract plaintext streams directly from PDF buffer
  try {
    const raw = buffer.toString("binary");
    const textMatches: string[] = [];
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match;
    const zlib = await import("zlib");

    while ((match = streamRegex.exec(raw)) !== null) {
      try {
        const streamData = Buffer.from(match[1], "binary");
        const decompressed = zlib.inflateSync(streamData).toString("utf-8");
        const tjMatches = decompressed.match(/\((.*?)\)\s*Tj/g);
        if (tjMatches) {
          textMatches.push(
            tjMatches.map((t) => t.replace(/^\(|\)\s*Tj$/g, "")).join(" ")
          );
        }
      } catch {
        // Continue scanning
      }
    }

    if (textMatches.length > 0 && textMatches.join(" ").length > 30) {
      return textMatches.join("\n\n");
    }
  } catch (fallbackErr) {
    console.warn("Fallback stream extraction failed:", fallbackErr);
  }

  throw new Error("Failed to extract text from PDF. The file may be image-only, corrupted, or encrypted.");
}

/**
 * Clean extracted text
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[^\x20-\x7E\n\t]/g, " ") // Remove non-printable characters
    .trim();
}

/**
 * Split text into overlapping chunks
 */
export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue;

    if (
      currentChunk.length + paragraph.length > CHUNK_SIZE &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());

      // Keep overlap from the end of the previous chunk
      const words = currentChunk.split(" ");
      const overlapWords = words.slice(
        Math.max(0, words.length - Math.floor(CHUNK_OVERLAP / 5))
      );
      currentChunk = overlapWords.join(" ") + "\n\n" + paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // If no paragraphs found (e.g., continuous text), do character-based chunking
  if (chunks.length === 0) {
    for (let i = 0; i < text.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
      chunks.push(text.slice(i, i + CHUNK_SIZE));
      if (i + CHUNK_SIZE >= text.length) break;
    }
  }

  return chunks.filter((c) => c.length > 50); // Filter out tiny chunks
}

/**
 * Full document processing pipeline
 * Extracts, cleans, chunks, embeds, and stores
 */
export async function processDocument(
  materialId: string,
  buffer: Buffer,
  fileType: string,
  fileName: string
): Promise<{ chunkCount: number }> {
  // Step 1: Extract text
  const rawText = await extractText(buffer, fileType, fileName);

  // Step 2: Clean text
  const cleanedText = cleanText(rawText);

  if (cleanedText.length < 50) {
    throw new Error("Document appears to be empty or unreadable");
  }

  // Step 3: Chunk text
  const chunks = chunkText(cleanedText);

  // Step 4: Store chunks (with optional embeddings)
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Try to generate embedding (optional - won't fail if not available)
    let embedding: number[] = [];
    try {
      embedding = await generateEmbedding(chunk);
    } catch {
      // Embeddings are optional, continue without them
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

  // Step 5: Update material status
  await prisma.studyMaterial.update({
    where: { id: materialId },
    data: {
      status: "ready",
      chunkCount: chunks.length,
    },
  });

  return { chunkCount: chunks.length };
}

/**
 * Simple keyword-based retrieval (cosine similarity when embeddings available)
 * Returns most relevant chunks for a query
 */
export async function retrieveRelevantChunks(
  materialId: string,
  query: string,
  topK: number = 5
): Promise<string[]> {
  const chunks = await prisma.documentChunk.findMany({
    where: { materialId },
    select: { content: true, embedding: true, chunkIndex: true },
    orderBy: { chunkIndex: "asc" },
  });

  if (chunks.length === 0) return [];

  // If embeddings are available, use cosine similarity
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

  // Score each chunk by keyword relevance
  const scored = chunks.map((chunk) => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      // Count occurrences
      const regex = new RegExp(word, "gi");
      const matches = contentLower.match(regex);
      score += matches ? matches.length : 0;
    }

    return { content: chunk.content, score };
  });

  // Sort by score, return top K
  scored.sort((a, b) => b.score - a.score);

  // If no good matches, return first chunks (beginning of document often has overview)
  const topChunks = scored.slice(0, topK);
  const nonZero = topChunks.filter((c) => c.score > 0);

  if (nonZero.length > 0) {
    return nonZero.map((c) => c.content);
  }

  // Fall back to first chunks
  return chunks.slice(0, topK).map((c) => c.content);
}

/**
 * Get all chunks for a material (for revision notes etc.)
 */
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
