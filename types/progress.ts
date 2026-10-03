export interface TopicStat {
  topic: string;
  accuracy: number;
  incorrect?: number;
  total: number;
}

export interface RecentActivity {
  id: string;
  type: "upload" | "quiz" | "chat" | string;
  title: string;
  date: string | Date;
}

export interface StudyHistoryRecord {
  date: string;
  minutes: number;
}

export interface ProgressSummary {
  materialsCount: number;
  totalChunks: number;
  totalAttempts: number;
  avgScore: number;
  totalTasks: number;
  completedTasks: number;
  streak: number;
  weakTopics: TopicStat[];
  strongTopics?: TopicStat[];
  recentAttempts?: Array<{
    id: string;
    quizTitle: string;
    score: number;
    total: number;
    date: string | Date;
  }>;
  recentActivities: RecentActivity[];
  studyHistory?: StudyHistoryRecord[];
}
