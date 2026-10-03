export interface StudyTask {
  id: string;
  planId: string;
  day: number;
  title: string;
  description?: string | null;
  duration: number;
  completed: boolean;
  completedAt?: string | Date | null;
  createdAt?: string | Date;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  goal: string;
  examDate?: string | Date | null;
  hoursPerDay: number;
  topics: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  tasks: StudyTask[];
}

export interface CreatePlanPayload {
  goal: string;
  examDate?: string;
  hoursPerDay?: number;
  topics?: string[];
}
