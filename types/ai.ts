export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GenerateTextOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateTextResult {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

export interface AIProvider {
  generateText(options: GenerateTextOptions): Promise<GenerateTextResult>;
  generateEmbedding?(text: string): Promise<number[]>;
  isAvailable(): Promise<boolean>;
  getModelName(): string;
}

export interface AIHealthStatus {
  available: boolean;
  provider: string;
  model: string;
  database?: string;
  status?: string;
  error?: string;
}

export interface KeyConcept {
  concept: string;
  definition: string;
  example: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface RevisionMaterial {
  summary: string;
  keyConcepts: KeyConcept[];
  flashcards: Flashcard[];
  commonMistakes: string[];
  examTips: string[];
  quickRevision: string;
}
