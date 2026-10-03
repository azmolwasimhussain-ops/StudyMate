import { extractPdfText } from "./pdf";

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
