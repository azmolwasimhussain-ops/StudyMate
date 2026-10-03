export const DEFAULT_AI_PROVIDER = "ollama";
export const DEFAULT_AI_MODEL = "gemma2:2b";
export const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";

export const AI_TIMEOUT_MS = {
  HEALTH_CHECK: 5000,
  TAGS_FETCH: 4000,
  TEXT_GENERATION: 120000,
  EMBEDDING: 30000,
} as const;

export const DEFAULT_AI_TEMPERATURES = {
  CHAT: 0.7,
  QUIZ: 0.4,
  PLANNER: 0.4,
  REVISION: 0.4,
} as const;
