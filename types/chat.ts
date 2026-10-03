export type ChatMode = "simple" | "detailed" | "exam_ready";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: string[] | null;
  createdAt: string | Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  materialId?: string | null;
  title?: string | null;
  mode: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  material?: {
    id: string;
    title: string;
  } | null;
  messages?: ChatMessage[];
  _count?: {
    messages: number;
  };
}

export interface ChatQueryPayload {
  query: string;
  materialId?: string;
  mode?: ChatMode;
  sessionId?: string;
}

export interface ChatResponse {
  success: boolean;
  sessionId: string;
  messageId: string;
  content: string;
  model: string;
  sources?: string[];
  mode: string;
}
