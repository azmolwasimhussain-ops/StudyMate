import { getAIProvider } from "./provider-factory";
import { buildRevisionPrompt } from "./prompts";
import { extractJson } from "./json-parser";
import { DEFAULT_AI_TEMPERATURES } from "@/lib/constants/ai";
import { RevisionMaterial } from "@/types/ai";

export async function generateRevisionNotes({
  context,
  materialTitle,
}: {
  context: string;
  materialTitle: string;
}): Promise<RevisionMaterial> {
  const provider = getAIProvider();
  const { system, user } = buildRevisionPrompt({ context, materialTitle });

  const result = await provider.generateText({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: DEFAULT_AI_TEMPERATURES.REVISION,
    maxTokens: 4096,
  });

  try {
    const raw = extractJson<any>(result.content);
    return {
      summary: raw.summary || "",
      keyConcepts: raw.keyConcepts || raw.keyConceptss || [],
      flashcards: raw.flashcards || [],
      commonMistakes: raw.commonMistakes || [],
      examTips: raw.examTips || [],
      quickRevision:
        typeof raw.quickRevision === "string"
          ? raw.quickRevision
          : Array.isArray(raw.quickRevision)
          ? raw.quickRevision.join("\n")
          : "",
    };
  } catch {
    throw new Error(
      `AI generated an invalid JSON response for revision notes. Raw content: ${result.content.slice(0, 150)}...`
    );
  }
}
