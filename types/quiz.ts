export type QuizDifficulty = "easy" | "medium" | "hard";
export type QuizQuestionType = "mcq" | "mixed";

export interface QuizQuestionItem {
  id?: string;
  quizId?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic?: string;
}

export interface QuizAttemptAnswer {
  questionId: string;
  selectedOption: number;
}

export interface QuizAttemptResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  total: number;
  timeTaken?: number | null;
  createdAt: string | Date;
  quiz?: {
    title: string;
    difficulty?: string;
  };
}

export interface QuizItem {
  id: string;
  materialId: string;
  title: string;
  difficulty: string;
  questionCount: number;
  createdAt: string | Date;
  material?: {
    id: string;
    title: string;
  };
  questions?: QuizQuestionItem[];
  attempts?: QuizAttemptResult[];
}
