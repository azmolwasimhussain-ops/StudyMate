import { getAIProvider } from "./provider-factory";
import { buildStudyPlanPrompt } from "./prompts";
import { extractJson } from "./json-parser";
import { DEFAULT_AI_TEMPERATURES } from "@/lib/constants/ai";

export async function generateStudyPlan({
  goal,
  examDate,
  hoursPerDay,
  topics,
}: {
  goal: string;
  examDate?: string;
  hoursPerDay: number;
  topics: string[];
}): Promise<{
  title: string;
  totalDays: number;
  tasks: Array<{
    day: number;
    title: string;
    description: string;
    duration: number;
    topics: string[];
  }>;
}> {
  const provider = getAIProvider();
  const { system, user } = buildStudyPlanPrompt({
    goal,
    examDate,
    hoursPerDay,
    topics,
  });

  const result = await provider.generateText({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: DEFAULT_AI_TEMPERATURES.PLANNER,
    maxTokens: 4096,
  });

  try {
    return extractJson<{
      title: string;
      totalDays: number;
      tasks: Array<{
        day: number;
        title: string;
        description: string;
        duration: number;
        topics: string[];
      }>;
    }>(result.content);
  } catch {
    throw new Error(
      `AI generated an invalid JSON response for study plan. Raw content: ${result.content.slice(0, 150)}...`
    );
  }
}
