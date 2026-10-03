/**
 * Main AI module - factory that returns the configured provider
 * and exposes high-level study functions
 */

import { OllamaProvider } from "./ollama";
import { AIProvider, GenerateTextResult } from "./provider";
import {
  buildChatPrompt,
  buildQuizPrompt,
  buildStudyPlanPrompt,
  buildRevisionPrompt,
  buildWeakTopicPrompt,
} from "./prompts";

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!_provider) {
    const providerType = process.env.AI_PROVIDER || "ollama";
    switch (providerType) {
      case "ollama":
      default:
        _provider = new OllamaProvider();
        break;
    }
  }
  return _provider;
}

export async function checkAIAvailability(): Promise<{
  available: boolean;
  provider: string;
  model: string;
}> {
  const provider = getAIProvider();
  const available = await provider.isAvailable();
  return {
    available,
    provider: process.env.AI_PROVIDER || "ollama",
    model: provider.getModelName(),
  };
}

/**
 * Safely parse JSON from LLM response which may contain markdown code fences
 */
function extractJson<T>(rawText: string): T {
  let cleaned = rawText.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  // Find first { or [ and last } or ]
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.slice(startIdx, endIdx + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Try removing trailing commas
    const withoutTrailingCommas = cleaned.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(withoutTrailingCommas);
  }
}

/**
 * Generate an answer to a study question using RAG context
 */
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
    temperature: 0.7,
  });
}

/**
 * Generate quiz questions from study material
 */
export async function generateQuizQuestions({
  context,
  numQuestions,
  difficulty,
  questionType,
}: {
  context: string;
  numQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  questionType: "mcq" | "mixed";
}): Promise<{
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    topic: string;
  }>;
}> {
  const provider = getAIProvider();
  const { system, user } = buildQuizPrompt({
    context,
    numQuestions,
    difficulty,
    questionType,
  });

  const result = await provider.generateText({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
    maxTokens: 4096,
  });

  try {
    const parsed = extractJson<{
      questions: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
        topic: string;
      }>;
    }>(result.content);
    return parsed;
  } catch {
    throw new Error(
      `AI generated an invalid JSON response for quiz. Raw content: ${result.content.slice(0, 150)}...`
    );
  }
}

/**
 * Generate a personalized study plan
 */
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
    temperature: 0.4,
    maxTokens: 4096,
  });

  try {
    const parsed = extractJson<{
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
    return parsed;
  } catch {
    throw new Error(
      `AI generated an invalid JSON response for study plan. Raw content: ${result.content.slice(0, 150)}...`
    );
  }
}

/**
 * Generate revision notes from study material
 */
export async function generateRevisionNotes({
  context,
  materialTitle,
}: {
  context: string;
  materialTitle: string;
}): Promise<{
  summary: string;
  keyConcepts: Array<{
    concept: string;
    definition: string;
    example: string;
  }>;
  flashcards: Array<{ front: string; back: string }>;
  commonMistakes: string[];
  examTips: string[];
  quickRevision: string;
}> {
  const provider = getAIProvider();
  const { system, user } = buildRevisionPrompt({ context, materialTitle });

  const result = await provider.generateText({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
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

/**
 * Generate embeddings for a text (for RAG)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = getAIProvider();
  if (!provider.generateEmbedding) {
    return [];
  }
  try {
    return await provider.generateEmbedding(text);
  } catch {
    return [];
  }
}
