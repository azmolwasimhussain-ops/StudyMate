/**
 * AI Provider abstraction for StudyMate
 * Supports: Ollama (local open-weight models), with extensible interface
 */

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
