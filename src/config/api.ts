// API路径配置
export const API_PATHS = {
  // 基础路径
  BASE: "/api",

  // 网站地图相关
  SITEMAP: {
    GENERATE: "/sitemap",
    AUTO: "/auto-sitemap",
    LOCAL: "/local-sitemap",
  },

  // 任务相关
  TASK: {
    SUBMIT: "/task/submit",
    STATUS: "/task/status",
    RESULT: "/task/result",
    LIST: "/task/list",
    LOG: "/task/log",
    DELETE: "/task/delete",
  },

  // 系统相关
  SYSTEM: {
    HEALTH: "/health",
  },
} as const;

// API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// 任务状态
export type TaskStatus = "pending" | "processing" | "success" | "fail";

// 任务类型
export type TaskType = "auto" | "manual" | "local";

// 任务信息
export interface TaskInfo {
  id: string;
  type: TaskType;
  status: TaskStatus;
  progress: number;
  error?: string;
  retryCount?: number;
  createdAt: number;
  updatedAt: number;
}

// 任务列表响应
export interface TaskListResponse {
  tasks: TaskInfo[];
  total: number;
}

// 任务日志响应
export interface TaskLogResponse {
  log: string[];
  taskId: string;
}
