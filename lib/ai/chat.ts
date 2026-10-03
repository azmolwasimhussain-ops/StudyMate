import { getAIProvider } from "./provider-factory";
import { buildChatPrompt } from "./prompts";
import { GenerateTextResult } from "@/types/ai";
import { DEFAULT_AI_TEMPERATURES } from "@/lib/constants/ai";

export async function generateStudyAnswer({
  query,
  context,
  mode,
  materialTitle,
}: {
  query: string;
  context: string;
  mode: "simple" | "detailed" | "exam_ready";
  materialTitle?: string;
}): Promise<GenerateTextResult> {
  const provider = getAIProvider();
  const { system, user } = buildChatPrompt({ query, context, mode, materialTitle });

  return provider.generateText({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: DEFAULT_AI_TEMPERATURES.CHAT,
  });
}
