export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
};

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/octet-stream",
];

export const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".md"];

export const DEFAULT_USER_EMAIL = "student@studymate.dev";
export const DEFAULT_USER_NAME = "Alex Rivera";

export const RAG_CONFIG = {
  CHUNK_SIZE: 1000,
  CHUNK_OVERLAP: 200,
  DEFAULT_TOP_K: 4,
  MAX_CHUNKS_FOR_REVISION: 15,
  MAX_CHUNKS_FOR_QUIZ: 15,
} as const;
