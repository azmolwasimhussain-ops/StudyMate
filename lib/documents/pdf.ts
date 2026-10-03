export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = (pdfParseModule.default || pdfParseModule) as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    if (data && data.text && data.text.trim()) {
      return data.text;
    }
  } catch (error) {
    console.error("PDF parse error:", error);
  }

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
