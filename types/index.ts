export interface SubtaskItem {
  id: string;
  taskId?: string;
  text: string;
  completed: boolean;
  order?: number;
  createdAt?: string | number | Date;
}

export interface TaskItem {
  id: string;
  userId?: string;
  text: string;
  notes: string;
  projectId: string | null;
  completed: boolean;
  completedAt?: string | null;
  subtasks: SubtaskItem[];
  createdAt: string | number;
  updatedAt?: string | number;
}

export interface ProjectItem {
  id: string;
  userId?: string;
  name: string;
  parentId: string | null;
  expanded?: boolean;
  createdAt?: string | number;
  children?: ProjectItem[];
}

export interface UserSettings {
  apiKey?: string;
  apiModel: string;
  theme: string;
  dailyAiCount?: number;
  lastAiDate?: string;
  hasCentralKey?: boolean;
}

export interface GeminiModelInfo {
  name: string;
  displayName: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  description?: string;
}
