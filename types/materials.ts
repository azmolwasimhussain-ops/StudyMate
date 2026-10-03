export interface StudyMaterial {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  pageCount?: number | null;
  chunkCount?: number | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  _count?: {
    chunks: number;
    quizzes: number;
    chatSessions: number;
  };
}

export interface DocumentChunk {
  id: string;
  materialId: string;
  content: string;
  chunkIndex: number;
  pageNumber?: number | null;
  embedding?: number[];
  metadata?: Record<string, unknown> | null;
  createdAt?: string | Date;
}

export interface MaterialWithDetails extends StudyMaterial {
  chunks?: Pick<DocumentChunk, "id" | "chunkIndex" | "content">[];
  quizzes?: Array<{
    id: string;
    title: string;
    questionCount: number;
    createdAt: string | Date;
  }>;
}
