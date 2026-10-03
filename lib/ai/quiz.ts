import { getAIProvider } from "./provider-factory";
import { buildQuizPrompt } from "./prompts";
import { extractJson } from "./json-parser";
import { DEFAULT_AI_TEMPERATURES } from "@/lib/constants/ai";
import { QuizDifficulty, QuizQuestionType } from "@/types/quiz";

export async function generateQuizQuestions({
  context,
  numQuestions,
  difficulty,
  questionType,
}: {
  context: string;
  numQuestions: number;
  difficulty: QuizDifficulty;
  questionType: QuizQuestionType;
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
    temperature: DEFAULT_AI_TEMPERATURES.QUIZ,
    maxTokens: 4096,
  });

  try {
    return extractJson<{
      questions: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
        topic: string;
      }>;
    }>(result.content);
  } catch {
    throw new Error(
      `AI generated an invalid JSON response for quiz. Raw content: ${result.content.slice(0, 150)}...`
    );
  }
}
