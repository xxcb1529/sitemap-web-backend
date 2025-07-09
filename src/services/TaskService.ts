import {
  createTask,
  getTask,
  updateTask,
  getAllTasks,
  appendTaskLog,
  SitemapTask,
} from "../utils/taskManager";
import { SitemapService } from "./SitemapService";
import { TaskStatus } from "../config/api";

const MAX_RETRY = 3;
const TASK_TIMEOUT = 10 * 60 * 1000; // 10分钟

export interface TaskStatusResponse {
  status: TaskStatus;
  progress: number;
  error?: string;
  retryCount?: number;
}

export interface TaskListResponse {
  tasks: SitemapTask[];
  total: number;
}

export interface TaskLogResponse {
  log: string[];
  taskId: string;
}

export class TaskService {
  private sitemapService: SitemapService;

  constructor() {
    this.sitemapService = new SitemapService();
  }

  // 提交任务
  async submitTask(
    type: "auto" | "manual" | "local",
    params: any
  ): Promise<SitemapTask> {
    const task = createTask(type, params);

    // 异步处理任务
    this.processSitemapTask(task);

    return task;
  }

  // 获取任务状态
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const task = getTask(taskId);
    if (!task) {
      throw new Error("任务不存在");
    }

    return {
      status: task.status,
      progress: task.progress,
      error: task.error,
      retryCount: task.retryCount,
    };
  }

  // 获取任务结果
  async getTaskResult(taskId: string): Promise<string> {
    const task = getTask(taskId);
    if (!task) {
      throw new Error("任务不存在");
    }

    if (task.status !== "success") {
      throw new Error("任务未完成");
    }

    return task.result || "";
  }

  // 获取任务列表
  async getTaskList(filter?: Partial<SitemapTask>): Promise<TaskListResponse> {
    const tasks = getAllTasks(filter);
    return {
      tasks,
      total: tasks.length,
    };
  }

  // 获取任务日志
  async getTaskLog(taskId: string): Promise<TaskLogResponse> {
    const task = getTask(taskId);
    if (!task) {
      throw new Error("任务不存在");
    }

    return {
      log: task.log || [],
      taskId: task.id,
    };
  }

  // 删除任务
  async deleteTask(taskId: string): Promise<void> {
    const task = getTask(taskId);
    if (!task) {
      throw new Error("任务不存在");
    }

    // 这里可以添加删除任务的逻辑
    // 目前taskManager没有删除功能，可以后续扩展
    // 暂时只返回成功，实际删除逻辑需要扩展taskManager
  }

  // 异步处理任务主逻辑，支持失败重试和超时
  private async processSitemapTask(task: SitemapTask) {
    updateTask(task.id, { status: "processing", progress: 10 });
    appendTaskLog(task.id, "任务开始处理");

    let finished = false;
    let timer = setTimeout(() => {
      if (!finished) {
        updateTask(task.id, {
          status: "fail",
          error: "任务超时",
          progress: 100,
        });
        appendTaskLog(task.id, "任务超时");
      }
    }, TASK_TIMEOUT);

    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        let xml: string;

        if (task.type === "auto") {
          const { url, maxDepth, changefreq, priority, lastmod } = task.params;
          appendTaskLog(task.id, `自动爬取第${attempt}次尝试`);
          xml = await this.sitemapService.generateFromCrawling(url, {
            maxDepth: maxDepth || 3,
            changefreq,
            priority,
            lastmod,
          });
        } else if (task.type === "manual") {
          const { urls, changefreq, priority, lastmod } = task.params;
          appendTaskLog(task.id, `手动输入第${attempt}次尝试`);
          xml = await this.sitemapService.generateFromUrls(urls, {
            changefreq,
            priority,
            lastmod,
          });
        } else if (task.type === "local") {
          const { dirPath, baseUrl, changefreq, priority, lastmod } =
            task.params;
          appendTaskLog(task.id, `本地扫描第${attempt}次尝试`);
          xml = await this.sitemapService.generateFromLocalDirectory(
            dirPath,
            baseUrl,
            {
              changefreq,
              priority,
              lastmod,
            }
          );
        } else {
          throw new Error(`不支持的任务类型: ${task.type}`);
        }

        updateTask(task.id, { result: xml, status: "success", progress: 100 });
        appendTaskLog(task.id, "任务成功完成");
        finished = true;
        clearTimeout(timer);
        return;
      } catch (err: any) {
        appendTaskLog(task.id, `第${attempt}次失败: ${err.message}`);
        updateTask(task.id, { retryCount: attempt, error: err.message });

        if (attempt === MAX_RETRY) {
          updateTask(task.id, { status: "fail", progress: 100 });
          appendTaskLog(task.id, "任务最终失败");
          finished = true;
          clearTimeout(timer);
        }
      }
    }
  }
}
